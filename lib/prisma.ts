// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// 🧠 Evitamos múltiples instancias en modo desarrollo
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'], // opcional: podés quitarlo si no querés logs
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
