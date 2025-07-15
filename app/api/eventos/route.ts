import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

// Tipo esperado del token
type TokenPayload = {
  rol: string;
  sub: number;
};

function esTokenPayload(obj: unknown): obj is TokenPayload {
  if (
    typeof obj !== "object" ||
    obj === null ||
    !("rol" in obj) ||
    !("sub" in obj)
  ) return false;

  const payload = obj as Record<string, unknown>;
  return typeof payload.rol === "string" && typeof payload.sub === "number";
}

// GET eventos por fecha y hora (opcionalmente)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fechaStr = searchParams.get("fecha");
  const horaMin = searchParams.get("desde"); // "08:00"
  const horaMax = searchParams.get("hasta"); // "18:00"

  if (!fechaStr) {
    return NextResponse.json({ error: "Fecha requerida" }, { status: 400 });
  }

  const fecha = new Date(fechaStr);
  const fechaInicio = new Date(fecha);
  const fechaFin = new Date(fecha);
  fechaInicio.setHours(0, 0, 0, 0);
  fechaFin.setHours(23, 59, 59, 999);

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let usuarioId: number;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload | string;
    if (typeof decoded === "string" || !esTokenPayload(decoded)) {
      throw new Error("Token inválido");
    }
    usuarioId = decoded.sub;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const eventos = await prisma.evento.findMany({
    where: {
      usuarioId,
      fecha: {
        gte: fechaInicio,
        lte: fechaFin,
      },
      ...(horaMin && { hora: { gte: horaMin } }),
      ...(horaMax && { hora: { lte: horaMax } }),
    },
    orderBy: { hora: "asc" },
  });

  return NextResponse.json(eventos);
}

// POST nuevo evento
export async function POST(req: Request) {
  const body = await req.json();
  const { fecha, hora, texto } = body;

  if (!fecha || !hora || !texto?.trim()) {
    return NextResponse.json({ error: "Campos requeridos" }, { status: 400 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let usuarioId: number;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload | string;
    if (typeof decoded === "string" || !esTokenPayload(decoded)) {
      throw new Error("Token inválido");
    }
    usuarioId = decoded.sub;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const nuevo = await prisma.evento.create({
    data: {
      fecha: new Date(fecha),
      hora,
      texto,
      usuarioId,
    },
  });

  return NextResponse.json(nuevo);
}
