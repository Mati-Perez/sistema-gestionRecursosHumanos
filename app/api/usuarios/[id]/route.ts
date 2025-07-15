import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { $Enums } from "@prisma/client";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!);

async function verificarToken(request: NextRequest, rolesPermitidos: string[]) {
  const token = request.cookies.get("token")?.value;
  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return rolesPermitidos.includes(payload.rol as string);
  } catch {
    return false;
  }
}

function obtenerIdDesdeUrl(url: string): number | null {
  const idStr = url.split("/").pop();
  const idInt = idStr && !isNaN(Number(idStr)) ? parseInt(idStr) : null;
  return idInt;
}

export async function GET(request: NextRequest) {
  const autorizado = await verificarToken(request, ["ADMIN"]);
  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const id = obtenerIdDesdeUrl(request.nextUrl.pathname);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
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
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (err: unknown) {
    console.error("❌ Error al obtener usuario:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const autorizado = await verificarToken(request, ["ADMIN"]);
  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const id = obtenerIdDesdeUrl(request.nextUrl.pathname);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    const body = await request.json();

    // Soft delete
    if ("estado" in body && body.estado === false && Object.keys(body).length === 1) {
      const actualizado = await prisma.usuario.update({
        where: { id },
        data: { estado: false },
      });
      return NextResponse.json(actualizado);
    }

    const actualizado = await prisma.usuario.update({
      where: { id },
      data: {
        nombre: body.nombre,
        email: body.email,
        rol: body.rol as $Enums.Rol,
        estado: body.estado,
        fotoUrl: body.fotoUrl,
      },
    });

    return NextResponse.json(actualizado);
  } catch (err: unknown) {
    console.error("❌ Error al actualizar usuario:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const autorizado = await verificarToken(request, ["ADMIN"]);
  if (!autorizado) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const id = obtenerIdDesdeUrl(request.nextUrl.pathname);
  if (!id) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  try {
    await prisma.usuario.delete({
      where: { id },
    });

    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    console.error("❌ Error al eliminar usuario:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
