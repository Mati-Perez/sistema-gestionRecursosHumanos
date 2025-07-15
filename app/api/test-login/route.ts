import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const usuario = await prisma.usuario.findUnique({ where: { email } })
  if (!usuario) {
    return NextResponse.json({ ok: false, mensaje: 'Usuario no encontrado' }, { status: 404 })
  }

  const coincide = await bcrypt.compare(password, usuario.password)

  return NextResponse.json({
    ok: coincide,
    mensaje: coincide
      ? '✅ Contraseña válida. Coincide con el hash.'
      : '❌ Contraseña incorrecta. El hash no coincide.',
  })
}
