import { defineConfig } from 'prisma/config'
import { config } from 'dotenv'
import path from 'node:path'

// Prisma CLI doesn't load .env.local — load it manually
config({ path: path.resolve('.env.local') })

export default defineConfig({
  datasource: {
    // Use unpooled URL for migrations (pooler doesn't support migration protocol)
    url: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? '',
  },
})
