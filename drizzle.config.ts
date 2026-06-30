import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const url = process.env.TURSO_CONNECTION_URL;
const token = process.env.TURSO_AUTH_TOKEN;

if (!url) throw new Error('Falta TURSO_CONNECTION_URL');
if (!token) throw new Error('Falta TURSO_AUTH_TOKEN');

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url,
    authToken: token,
  },
});
