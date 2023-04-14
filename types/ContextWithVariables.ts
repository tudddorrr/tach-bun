import { Context } from 'hono'
import { Variables } from '../lib/createApp'

export type ContextWithVariables = Context<{ Variables: Variables }>
