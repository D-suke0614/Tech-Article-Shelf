import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import type { CreateNextContextOptions } from '@trpc/server/adapters/next'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) throw new Error('DATABASE_URL is not set')

const adapter = new PrismaLibSql({
  url: dbUrl,
})

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
}

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = new PrismaClient({ adapter })
}

// gsspなどでデータ取得がしたい場合はexportする必要があり
const prisma = globalForPrisma.prisma

export const createContext = (opts: CreateNextContextOptions) => {
  return {
    prisma,
    req: opts.req,
    res: opts.res,
  }
}

export type Context = ReturnType<typeof createContext>
