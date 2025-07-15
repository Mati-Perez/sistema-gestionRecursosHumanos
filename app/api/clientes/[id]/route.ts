import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const id = Number(req.nextUrl.pathname.split("/").pop()); // extrae el ID de la URL
  const cliente = await prisma.cliente.findUnique({
    where: { id },
  });
  return NextResponse.json(cliente);
}

export async function PUT(req: NextRequest) {
  const url = req.nextUrl.pathname;
  const idRaw = url.split("/").pop();
  const id = Number(idRaw);

  if (!idRaw || isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

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
    if (error instanceof Error) {
      console.error("Error al actualizar cliente:", error.message);
    } else {
      console.error("Error desconocido al actualizar cliente");
    }

    return NextResponse.json(
      { error: "No se pudo actualizar el cliente" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.pathname.split("/").pop());
  await prisma.cliente.update({
    where: { id },
    data: { estado: false },
  });
  return NextResponse.json({ ok: true });
}
