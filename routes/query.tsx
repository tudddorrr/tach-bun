import getPromptTables from '../lib/database/getPromptTables'
import getQueryFromPrompt from '../lib/openai/getQueryFromPrompt'
import Results from '../components/Results'
import { RowDataPacket } from 'mysql2/promise'
import createApp from '../lib/createApp'
import { BlocklistItem } from '../types/BlocklistItem'
import buildBlocklistText from '../lib/buildBlocklistText'
import { OpenAILog } from '../types/OpenAILog'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const query = createApp()

query.use('*', async (c, next) => {
  await next()

  if (typeof c.get('openAILogData') === 'object') {
    c.get('sqlite').run('insert into openai_logs (tables, prompt, query, success, cache_enabled, tokens_used) values (?1, ?2, ?3, ?4, ?5, ?6)', [
      c.get('openAILogData').tables,
      c.get('openAILogData').prompt,
      c.get('openAILogData').query,
      c.get('openAILogData').success,
      c.get('openAILogData').cache_enabled,
      c.get('openAILogData').tokens_used
    ])
  }
})

function sanitiseSQL(sql: string) {
  return sql.replaceAll('\n', ' ')
    .replaceAll(/( )\1{1,}/g, ' ')
}

const jsonSchema = z.object({
  tables: z.array(z.string()),
  prompt: z.string()
})

query.post(
  '/',
  zValidator('json', jsonSchema),
  zValidator('query', z.object({
    cache: z.enum(['0', '1']).optional()
  })),
  async (c) => {
    const { tables, prompt } = await c.req.json<z.infer<typeof jsonSchema>>()
    const { cache } = c.req.query()
    const checkCache = cache ? cache === '1' : true

    let sql = ''

    const existingLogs = checkCache
      ? c.get('sqlite').query('select * from openai_logs where tables = ?1 and prompt = ?2 order by id desc').all(tables.join(), prompt) as OpenAILog[]
      : []

    const useCache = existingLogs.length > 0
    let tokensUsed = 0

    if (useCache) {
      sql = existingLogs[0].query
    } else {
      const blocklist = c.get('sqlite').query('select table_name, column_name from blocklist_items').all() as BlocklistItem[]
      const createTableSyntaxes = await getPromptTables(c.get('db'), tables, blocklist)
      const blocklistText = buildBlocklistText(blocklist)
      const res = await getQueryFromPrompt(createTableSyntaxes, prompt, blocklistText)
      sql = sanitiseSQL(res.sql ?? '')
      tokensUsed = res.tokensUsed
    
      if (!sql) {
        return c.json({ message: 'No response from OpenAI' }, 503)
      }
    }

    c.set('openAILogData', {
      tables: tables.join(),
      prompt,
      query: sql,
      success: false,
      cache_enabled: checkCache,
      tokens_used: tokensUsed
    })

    try {
      const [rows, fields] = await c.get('db').execute(sql)
      c.set('openAILogData', { ...c.get('openAILogData'), success: true })

      const wantsJson = c.req.header('Accept') === 'application/json'
      if (wantsJson) {
        return c.json({
          data: rows,
          query: sql
        })
      }

      const wantsCSV = c.req.header('Accept') === 'text/csv'
      if (wantsCSV) {
        const header = fields.map((field) => field.name).join() + '\n'
        const body = (rows as RowDataPacket[]).map((row) => Object.values(row).join()).join('\n')
        return c.text(header + body)
      }

      return c.html(
        <Results
          columns={fields.map((field) => field.name)}
          data={rows as RowDataPacket[]}
        />
      )
    } catch (err) {
      return c.json({
        message: 'Invalid query supplied by OpenAI',
        query: sql
      }, 503)
    }
  }
)

export default query
