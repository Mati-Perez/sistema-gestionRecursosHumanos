import { PrismaClient } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const prisma = new PrismaClient()

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: Number(params.id) }
  })
  return NextResponse.json(cliente)
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const data = await req.json()
  const actualizado = await prisma.cliente.update({
    where: { id: Number(params.id) },
    data
  })
  return NextResponse.json(actualizado)
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  await prisma.cliente.update({
    where: { id: Number(params.id) },
    data: { estado: false },
  })

  return NextResponse.json({ ok: true })
}

