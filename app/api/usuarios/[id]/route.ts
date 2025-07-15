// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { jwtVerify } from 'jose'
import { $Enums } from '@prisma/client'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

async function verificarToken(request: NextRequest, rolesPermitidos: string[]) {
  const token = request.cookies.get('token')?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return rolesPermitidos.includes(payload.rol as string)
  } catch {
    return false
  }
}

export async function GET(request: NextRequest, context: { params: { id?: string } }) {
  const autorizado = await verificarToken(request, ['ADMIN']);
  if (!autorizado) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  // ✅ Evitás destructuring directo, accedés de forma segura
  const idRaw = context?.params?.id;
  const idInt = idRaw ? parseInt(idRaw) : null;

  if (!idInt) {
    return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: idInt },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        estado: true,
        fotoUrl: true,
        creadoEn: true,
      },
    });

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (err) {
    console.error('❌ Error al obtener usuario:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const autorizado = await verificarToken(request, ['ADMIN'])
  if (!autorizado) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = context.params

  try {
    const body = await request.json()

    // 👉 Soft delete si sólo se envía estado: false
    if ('estado' in body && body.estado === false && Object.keys(body).length === 1) {
      const actualizado = await prisma.usuario.update({
        where: { id: parseInt(id) },
        data: { estado: false },
      })
      return NextResponse.json(actualizado)
    }

    // 👉 Edición normal
    const actualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombre: body.nombre,
        email: body.email,
        rol: body.rol as $Enums.Rol,
        estado: body.estado,
        fotoUrl: body.fotoUrl,
      },
    })

    return NextResponse.json(actualizado)
  } catch (err) {
    console.error('❌ Error al actualizar usuario:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  const autorizado = await verificarToken(request, ['ADMIN'])
  if (!autorizado) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  const { id } = context.params

  try {
    await prisma.usuario.delete({
      where: { id: parseInt(id) },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('❌ Error al eliminar usuario:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
