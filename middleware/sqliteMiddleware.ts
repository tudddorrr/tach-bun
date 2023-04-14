import { Next } from 'hono'
import { Database } from 'bun:sqlite'
import { ContextWithVariables } from '../types/ContextWithVariables'

export default async (c: ContextWithVariables, next: Next) => {
  c.set('sqlite', new Database('db.sqlite'))
  await next()
  c.get('sqlite').close()
}
