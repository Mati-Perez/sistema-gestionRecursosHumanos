import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

interface TokenPayload {
  sub: number
  rol: 'ADMIN' | 'CLIENTE'
  nombre: string
  email: string
}

export async function POST(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) return NextResponse.json({ mensaje: 'No autenticado' }, { status: 401 })

  let usuarioId: number
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as TokenPayload
    usuarioId = decoded.sub
  } catch {
    return NextResponse.json({ mensaje: 'Token inválido' }, { status: 401 })
  }

  const { nombre, fotoUrl } = await request.json()

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: {
      nombre,
      ...(fotoUrl !== undefined && { fotoUrl }),
    },
  })
  

  return NextResponse.json({ mensaje: 'Perfil actualizado correctamente' })
}
