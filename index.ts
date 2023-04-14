import query from './routes/query'
import blocklist from './routes/blocklist'
import lexicon from './routes/lexicon'
import { logger } from 'hono/logger'
import createApp from './lib/createApp'
import databaseMiddleware from './middleware/databaseMiddleware'
import sqliteMiddleware from './middleware/sqliteMiddleware'
import runMigrations from './migrations/runMigrations'

runMigrations()

const app = createApp()

app.use('*', logger())
app.use('*', databaseMiddleware)
app.use('*', sqliteMiddleware)

app.route('/v1/query', query)
app.route('/v1/blocklist', blocklist)
app.route('/v1/lexicon', lexicon)

export default app
