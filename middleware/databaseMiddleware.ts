import { Next } from 'hono'
import createDatabaseConnection from '../lib/database/createDatabaseConnection'
import { ContextWithVariables } from '../types/ContextWithVariables'

export default async (c: ContextWithVariables, next: Next) => {
  c.set('db', await createDatabaseConnection())
  await next()
  await c.get('db').end()
}
