import { Hono } from 'hono'
import { Connection } from 'mysql2/promise'
import { Database } from 'bun:sqlite'
import { OpenAILog } from '../types/OpenAILog'

export type Variables = {
  db: Connection
  sqlite: Database
  openAILogData: OpenAILog
}

export default function createApp() {
  return new Hono<{ Variables: Variables}>()
}
