import { Database } from 'bun:sqlite'
import fs from 'node:fs/promises'

export default async function runMigrations() {
  const db = new Database('db.sqlite')
  db.run(`create table if not exists migrations (name varchar(255) primary key);`)

  const files = await fs.readdir('migrations')
  const migrations = files.filter((file) => /(\d\d)_(.*).sql/.test(file)).sort((a, b) => a.localeCompare(b))
  await Promise.all(migrations.map(async (migration) => {
    if (db.query('select 1 from migrations where name = ?').get(migration) === null) {
      console.info(`Running migration ${migration}`)
      db.run(await fs.readFile(`migrations/${migration}`, 'utf8'))
      db.run(`insert into migrations (name) values ('${migration}')`)
    }
  }))

  db.close()
}
