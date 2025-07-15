import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function crearUsuarioInicialSiNoExiste() {
  const existe = await prisma.usuario.findFirst()
  if (!existe) {
    const hash = await bcrypt.hash('123456789', 10)
    await prisma.usuario.create({
      data: {
        nombre: 'Matias',
        email: 'matiperez881@gmail.com',
        password: hash,
        rol: 'ADMIN',
      },
    })
  }
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  await crearUsuarioInicialSiNoExiste()

  return (
    <div className="h-full w-full flex flex-col justify-center px-4 bg-gradient-to-br from-sky-200 via-white to-emerald-200 px-4">
      <div className="w-full max-w-xl mx-auto">
        {children}
      </div>
    </div>
  )
}
