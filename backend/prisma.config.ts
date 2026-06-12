import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

// Migrations/CLI must use a DIRECT (session-mode) connection, never the
// pgbouncer transaction pooler. Fall back to DATABASE_URL if DIRECT_URL is unset.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL || env('DATABASE_URL'),
  },
})
