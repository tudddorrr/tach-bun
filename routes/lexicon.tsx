import { RowDataPacket } from 'mysql2'
import createApp from '../lib/createApp'
import Results from '../components/Results'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

type ShowTableRow = RowDataPacket & {
  [key: string]: string
}

type ShowColumnRow = RowDataPacket & {
  Field: string
}

const lexicon = createApp()

lexicon.post('/scan', async (c) => {
  const [rows] = await c.get('db').execute<ShowTableRow[]>('show tables')
  const tables = rows.map((row) => row[Object.keys(row)[0]])

  for (const tableName of tables) {
    c.get('sqlite').query('replace into lexicon_tables (table_name) values (?)').run(tableName)
    const [rows] = await c.get('db').execute<ShowColumnRow[]>(`show columns from ${tableName}`)

    const columns = rows.map((row) => row.Field)
    for (const columnName of columns) {
      c.get('sqlite').query('replace into lexicon_columns (table_name, column_name) values (?1, ?2)').run(tableName, columnName)
    }
  }

  const query = c.get('sqlite').query('select * from lexicon_columns')
  return c.json(query.all())
})

lexicon.get('/', async (c) => {
  return c.html(
    <Results
      columns={['table_name', 'column_name', 'description']}
      data={c.get('sqlite').query('select * from lexicon_columns').all()}
    />
  )
})

const jsonSchema = z.object({
  description: z.string()
})

lexicon.post('/:tableName',
  zValidator('json', jsonSchema),
  async (c) => {
    const { tableName } = c.req.param()
    const { description } = await c.req.json<z.infer<typeof jsonSchema>>()

    c.get('sqlite')
      .query('replace into lexicon_tables (table_name, description) values (?1, ?2)')
      .run(tableName, description)

    return c.json({})
  })

  lexicon.post('/:tableName/:columnName',
    zValidator('json', jsonSchema),
    async (c) => {
      const { tableName, columnName } = c.req.param()
      const { description } = await c.req.json<z.infer<typeof jsonSchema>>()

      c.get('sqlite')
        .query('replace into lexicon_tables (table_name) values (?)')
        .run(tableName)

      c.get('sqlite')
        .query('replace into lexicon_columns (table_name, column_name, description) values (?1, ?2, ?3)')
        .run(tableName, columnName, description)

      return c.json({})
    }
)

export default lexicon
