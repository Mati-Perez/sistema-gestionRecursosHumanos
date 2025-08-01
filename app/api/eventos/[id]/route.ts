// app/api/eventos/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { cookies } from "next/headers";

type TokenPayload = { rol: string; sub: number };

function esTokenPayload(obj: unknown): obj is TokenPayload {
  const p = obj as Record<string, unknown>;
  return (
    typeof p === "object" &&
    p !== null &&
    typeof p.rol === "string" &&
    typeof p.sub === "number"
  );
}

export async function DELETE(req: NextRequest) {
  const idRaw = req.nextUrl.pathname.split("/").pop();
  const id = Number(idRaw);

  if (!idRaw || isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
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

  const evento = await prisma.evento.findUnique({
    where: { id },
  });

  if (!evento || evento.usuarioId !== usuarioId) {
    return NextResponse.json({ error: "Evento no encontrado o no autorizado" }, { status: 404 });
  }

  await prisma.evento.delete({
    where: { id },
  });

  return NextResponse.json({ mensaje: "Evento eliminado correctamente" });
}


export async function PUT(req: Request) {
  const url = req.url || req.headers.get("x-url") || "";
  const idStr = url.split("/").pop();
  const id = Number(idStr);

  if (!idStr || isNaN(id)) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const body = await req.json();
  const { hora, texto } = body;

  if (!hora?.trim() || !texto?.trim()) {
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

  const evento = await prisma.evento.findUnique({
    where: { id },
  });

  if (!evento || evento.usuarioId !== usuarioId) {
    return NextResponse.json({ error: "Evento no encontrado o no autorizado" }, { status: 404 });
  }

  const actualizado = await prisma.evento.update({
    where: { id },
    data: { hora, texto },
  });

  return NextResponse.json(actualizado);
}
