import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
dotenv.config();

// Prisma 7 requires a driver adapter for direct database connections.
// We reuse the same DATABASE_URL as the existing pg pool (src/db/db.js).
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
