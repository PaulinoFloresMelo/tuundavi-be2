
import { drizzle } from 'drizzle-orm/libsql';
import { relations } from './relations/relations'

export function createDb(env: {
  TURSO_CONNECTION_URL: string
  TURSO_AUTH_TOKEN: string
}) {
  return drizzle({
    connection: {
      url: env.TURSO_CONNECTION_URL,
      authToken: env.TURSO_AUTH_TOKEN,
    },
     relations: relations
  })
}