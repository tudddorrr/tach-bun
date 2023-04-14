import { BlocklistItem } from '../types/BlocklistItem'

export default function buildBlocklistText(blocklist: BlocklistItem[]) {
  const parts = []
  const tables = new Set(blocklist.filter((item) => item.column_name !== '*').map((item) => item.table_name))
  for (const table of tables) {
    const columns = blocklist.filter((item) => item.table_name === table)
    parts.push(`${columns.map((item) => item.column_name).join(', ')} from the ${table} table`)
  }

  return parts.join(', ')
}
