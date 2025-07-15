import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'


const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const pagina = parseInt(searchParams.get('pagina') || '1')
  const filtro = searchParams.get('filtro') || ''
  const porPagina = 15

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where: {
        estado: true,
        OR: [
          { nombre: { contains: filtro, mode: 'insensitive' } },
          { profesion: { contains: filtro, mode: 'insensitive' } }
        ],
      },
      skip: (pagina - 1) * porPagina,
      take: porPagina,
      orderBy: { id: 'desc' },
      include: {
        usuario: true 
      }
    }),
    prisma.cliente.count({
      where: {
        OR: [
          { nombre: { contains: filtro, mode: 'insensitive' } },
          { profesion: { contains: filtro, mode: 'insensitive' } }
        ],
      }
    })
  ])

  return NextResponse.json({ clientes, total })
}


export async function POST(req: NextRequest) {
  const data = await req.json()

  const passwordPorDefecto = 'cliente1234'
  const hash = await bcrypt.hash(passwordPorDefecto, 10)

  const nuevo = await prisma.cliente.create({
    data: {
      nombre: data.nombre,
      apellido: data.apellido || '',
      email: data.email || '',
      profesion: data.profesion,
      razonSocial: data.nombre,
      compania: data.compania || '',
      cuit: crypto.randomUUID().slice(0, 13),
      dni: '00000000',
      telefono: data.telefono || '',
      estado: true,
      usuario: {
        create: {
          nombre: data.nombre,
          email: data.email,
          password: hash,
          rol: 'CLIENTE'
        }
      }
    }
  })

  return NextResponse.json(nuevo, { status: 201 })
}

