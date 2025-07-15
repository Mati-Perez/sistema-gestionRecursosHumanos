// app/api/pagos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // ruta según donde tengas configurado Prisma

export async function POST(req: Request) {
  const body = await req.json();
  const { fecha, tipo, monto, estado, empleadoDni } = body;

  if (!fecha || !tipo || !monto || !estado || !empleadoDni)
    return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });

  const empleado = await prisma.empleado.findFirst({
    where: { dni: empleadoDni },
  });

  if (!empleado)
    return NextResponse.json({ error: "Empleado no existe" }, { status: 404 });

  const nuevo = await prisma.pago.create({
    data: {
      fecha: new Date(fecha),
      tipo,
      monto,
      estado,
      empleadoId: empleado.id,
    },
  });

  return NextResponse.json(nuevo);
}
