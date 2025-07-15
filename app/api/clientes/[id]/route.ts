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
  const id = Number(req.nextUrl.pathname.split("/").pop());
  const data = await req.json();
  const actualizado = await prisma.cliente.update({
    where: { id },
    data,
  });
  return NextResponse.json(actualizado);
}

export async function DELETE(req: NextRequest) {
  const id = Number(req.nextUrl.pathname.split("/").pop());
  await prisma.cliente.update({
    where: { id },
    data: { estado: false },
  });
  return NextResponse.json({ ok: true });
}
