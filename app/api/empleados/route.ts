// app/api/empleados/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dni = searchParams.get("dni");
  if (!dni) return NextResponse.json({ error: "DNI requerido" }, { status: 400 });

  const empleado = await prisma.empleado.findFirst({ where: { dni } });
  if (!empleado) return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });

  return NextResponse.json(empleado);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nombre, apellido, dni, empresa, clienteId } = body;

  if (!nombre || !apellido || !dni || !empresa || !clienteId)
    return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });

  const nuevo = await prisma.empleado.create({
    data: {
      nombre,
      apellido,
      dni,
      compania: empresa,
      clienteId,
    },
  });

  return NextResponse.json(nuevo);
}
