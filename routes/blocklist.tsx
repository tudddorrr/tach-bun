import { HTTPException } from 'hono/http-exception'
import Results from '../components/Results'
import createApp from '../lib/createApp'

const blocklist = createApp()

blocklist.get('/', async (c) => {
  return c.html(
    <Results
      columns={['table_name', 'column_name']}
      data={c.get('sqlite').query('select * from blocklist_items').all()}
    />
  )
})

blocklist.post('/', async (c) => {
  const { tableName, columnName } = await c.req.json()
  
  const wildcardsForTable = c.get('sqlite').query(`select 1 from blocklist_items where table_name = ? and column_name = '*'`).all(tableName)
  if (wildcardsForTable.length > 0) {
    throw new HTTPException(400, { message: 'A wildcard already exists for this table, no other columns can be added to the blocklist' })
  }

  c.get('sqlite')
    .query('replace into blocklist_items (table_name, column_name) values (?1, ?2)')
    .run(tableName, columnName)

  return c.json({})
})

export default blocklist
