import { createMiddleware } from 'hono/factory'
import { createDb } from '../db'

export const dbMiddleware = createMiddleware<{
  Bindings: {
    TURSO_CONNECTION_URL: string
    TURSO_AUTH_TOKEN: string
  }
  Variables: {
    db: ReturnType<typeof createDb>
  }
}>(async (c, next) => {
  const db = createDb({
    TURSO_CONNECTION_URL: c.env.TURSO_CONNECTION_URL,
    TURSO_AUTH_TOKEN: c.env.TURSO_AUTH_TOKEN,
  })
  c.set('db', db)
  await next()
})