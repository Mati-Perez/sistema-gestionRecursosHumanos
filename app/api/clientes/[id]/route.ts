import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // 👈 Ideal usar import centralizado

function extraerId(req: NextRequest): number | null {
  const segments = req.nextUrl.pathname.split("/");
  const idStr = segments[segments.length - 1];
  const id = Number(idStr);
  return !isNaN(id) ? id : null;
}

export async function GET(req: NextRequest) {
  const id = extraerId(req);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  const cliente = await prisma.cliente.findUnique({
    where: { id },
  });

  if (!cliente) {
    return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
  }

  return NextResponse.json(cliente);
}

export async function PUT(req: NextRequest) {
  const id = extraerId(req);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  let data;
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
  }

  try {
    const actualizado = await prisma.cliente.update({
      where: { id },
      data,
    });

    return NextResponse.json(actualizado);
  } catch (error: unknown) {
    console.error("Error al actualizar cliente:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "No se pudo actualizar el cliente" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const id = extraerId(req);
  if (!id) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  try {
    await prisma.cliente.update({
      where: { id },
      data: { estado: false },
    });

    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    console.error("Error al eliminar cliente:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "No se pudo eliminar el cliente" }, { status: 500 });
  }
}
