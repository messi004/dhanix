import path from 'node:path'
import { defineConfig } from 'prisma/config'
import 'dotenv/config'

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
    'Please define DATABASE_URL in your .env file or environment before running Prisma.'
  )
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: databaseUrl,
  },
})
