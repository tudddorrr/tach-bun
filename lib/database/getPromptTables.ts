import { Connection, RowDataPacket } from 'mysql2/promise'
import { BlocklistItem } from '../../types/BlocklistItem'

type CreateTableSyntaxRow = RowDataPacket & {
  Table: string
  'Create Table': string
}

function stripExcessCharacters(createTableSyntax: string): string {
  return createTableSyntax
    .replace(/ ENGINE(.*)/, '')
    .replaceAll('  ', ' ')
    .replaceAll('\n', '')
    .replaceAll('`', '')
    .replaceAll(' NOT NULL', '')
    .replaceAll(' AUTO_INCREMENT', '')
    .replaceAll(' unsigned', '')
}

export default async function getPromptTables(connection: Connection, tables: string[], blocklist: BlocklistItem[]): Promise<string[]> {
  const tablesToSearch = tables.filter((table) => {
    return blocklist.every((item) => !(item.table_name === table && item.column_name === '*'))
  })

  const createTableSyntaxes = await Promise.all(tablesToSearch.map(async (tableName) => {
    try {
      const [createTableResults] = await connection.execute<CreateTableSyntaxRow[]>(`SHOW CREATE TABLE ${tableName}`)
      return createTableResults[0]['Create Table']
    } catch (err) {
      return null
    }
  }))

  return (createTableSyntaxes.filter((syntax) => Boolean(syntax)) as string[]).map(stripExcessCharacters)
}
