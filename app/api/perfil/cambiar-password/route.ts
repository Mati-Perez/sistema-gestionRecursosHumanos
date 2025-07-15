import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface TokenPayload {
  sub: number
  rol: 'ADMIN' | 'CLIENTE'
  nombre: string
  email: string
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value

  if (!token) {
    return NextResponse.json({ mensaje: 'No autenticado' }, { status: 401 })
  }

  let usuarioId: number

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as TokenPayload
    usuarioId = decoded.sub
  } catch {
    return NextResponse.json({ mensaje: 'Token inválido' }, { status: 401 })
  }

  const { actual, nueva } = await request.json()

  const usuario = await prisma.usuario.findUnique({
    where: { id: usuarioId },
  })

  if (!usuario) {
    return NextResponse.json({ mensaje: 'Usuario no encontrado' }, { status: 404 })
  }

  const coincide = await bcrypt.compare(actual, usuario.password)
  if (!coincide) {
    return NextResponse.json({ mensaje: 'Contraseña actual incorrecta' }, { status: 400 })
  }

  const nuevaHasheada = await bcrypt.hash(nueva, 10)

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { password: nuevaHasheada },
  })

  return NextResponse.json({ mensaje: 'Contraseña actualizada con éxito' })
}
