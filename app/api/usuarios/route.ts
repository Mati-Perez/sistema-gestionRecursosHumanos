// app/api/usuarios/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { Rol } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function verificarRol(token: string, rolesPermitidos: string[]) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const { payload } = await jwtVerify(token, secret)
  return rolesPermitidos.includes(payload.rol as string)
}


const USUARIOS_POR_PAGINA = 15

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const pagina = parseInt(searchParams.get('pagina') || '1', 10)
  const filtro = searchParams.get('filtro')?.toLowerCase() || ''

  const token = request.cookies.get('token')?.value
  if (!token || !(await verificarRol(token, ['ADMIN']))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  try {
    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where: {
          rol: { equals: Rol.USUARIO},
          OR: [
            { nombre: { contains: filtro, mode: 'insensitive' } },
            { email: { contains: filtro, mode: 'insensitive' } },
          ],
        },
        orderBy: { nombre: 'asc' },
        skip: (pagina - 1) * USUARIOS_POR_PAGINA,
        take: USUARIOS_POR_PAGINA,
        select: {
          id: true,
          nombre: true,
          email: true,
          fotoUrl: true,
        },
      }),
      prisma.usuario.count({
        where: {
          rol: { equals: Rol.USUARIO },
          OR: [
            { nombre: { contains: filtro, mode: 'insensitive' } },
            { email: { contains: filtro, mode: 'insensitive' } },
          ],
        },
      }),
    ])

    return NextResponse.json({ usuarios, total })
  } catch (err) {
    console.error('❌ Error en GET /api/usuarios:', err)
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  // Validación mínima
  if (!data?.email || !data?.nombre || !data?.rol) {
    return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
  }

  try {
    const existente = await prisma.usuario.findUnique({
      where: { email: data.email },
    })

    if (existente) {
      return NextResponse.json({ error: 'Email ya registrado' }, { status: 409 })
    }

    const passwordPorDefecto = 'cliente1234'
    const hash = await bcrypt.hash(passwordPorDefecto, 10)

    const nuevo = await prisma.usuario.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password: hash,
        rol: data.rol,
        estado: true,
        fotoUrl: data.fotoUrl || null,
      },
      select: {
        id: true,
        nombre: true,
        email: true,
        fotoUrl: true,
      }
    })

    return NextResponse.json(nuevo, { status: 201 })
  } catch (err) {
    console.error('❌ Error al crear usuario:', err)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}
