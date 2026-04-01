import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '@prisma/client';
import ws from 'ws';
import "dotenv/config";

// Required for Neon to run over WebSockets in standard Node/Next.js routes
neonConfig.webSocketConstructor = ws;

const connectionString = `${process.env.DATABASE_URL}`;

// Skip creating the Pool entirely. 
// Pass the config object directly to the PrismaNeon adapter:
const adapter = new PrismaNeon({ connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;