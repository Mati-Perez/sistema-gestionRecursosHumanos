import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

// Tipo personalizado para tu payload
type TokenPayload = {
  rol: string;
  sub: number;
};

// Guard para validar el token
function esTokenPayload(obj: unknown): obj is TokenPayload {
  if (
    typeof obj !== "object" ||
    obj === null ||
    !("rol" in obj) ||
    !("sub" in obj)
  ) {
    return false;
  }

  const payload = obj as Record<string, unknown>;

  return (
    typeof payload.rol === "string" &&
    typeof payload.sub === "number"
  );
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let usuario: TokenPayload;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload | string;

    if (typeof decoded === "string" || !esTokenPayload(decoded)) {
      throw new Error("Token inválido");
    }

    usuario = decoded;
  } catch {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  if (usuario.rol !== "ADMIN") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const [usuarios, clientes, empleados, facturas, pagos] = await Promise.all([
    prisma.usuario.findMany(),
    prisma.cliente.findMany(),
    prisma.empleado.findMany(),
    prisma.factura.findMany(),
    prisma.pago.findMany(),
  ]);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Sistema de Gestión";
  workbook.created = new Date();

  // 🔹 Usuarios
  if (usuarios.length > 0) {
    const hoja = workbook.addWorksheet("Usuarios");
    hoja.columns = [
      { header: "id", key: "id" },
      { header: "email", key: "email" },
      { header: "nombre", key: "nombre" },
      { header: "rol", key: "rol" },
      { header: "estado", key: "estado" },
      { header: "creadoEn", key: "creadoEn" },
      { header: "fotoUrl", key: "fotoUrl" },
    ];
    hoja.addRows(usuarios.map((u) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      estado: u.estado,
      creadoEn: u.creadoEn.toISOString(),
      fotoUrl: u.fotoUrl ?? "",
    })));
  }

  // 🔹 Clientes
  if (clientes.length > 0) {
    const hoja = workbook.addWorksheet("Clientes");
    hoja.columns = [
      { header: "id", key: "id" },
      { header: "razonSocial", key: "razonSocial" },
      { header: "compania", key: "compania" },
      { header: "cuit", key: "cuit" },
      { header: "dni", key: "dni" },
      { header: "telefono", key: "telefono" },
      { header: "estado", key: "estado" },
      { header: "apellido", key: "apellido" },
      { header: "email", key: "email" },
      { header: "nombre", key: "nombre" },
      { header: "profesion", key: "profesion" },
    ];
    hoja.addRows(clientes.map((c) => ({
      id: c.id,
      razonSocial: c.razonSocial,
      compania: c.compania,
      cuit: c.cuit,
      dni: c.dni,
      telefono: c.telefono,
      estado: c.estado,
      apellido: c.apellido,
      email: c.email,
      nombre: c.nombre,
      profesion: c.profesion,
    })));
  }

  // 🔹 Empleados
  if (empleados.length > 0) {
    const hoja = workbook.addWorksheet("Empleados");
    hoja.columns = [
      { header: "id", key: "id" },
      { header: "nombre", key: "nombre" },
      { header: "apellido", key: "apellido" },
      { header: "puesto", key: "puesto" },
      { header: "dni", key: "dni" },
      { header: "telefono", key: "telefono" },
      { header: "email", key: "email" },
      { header: "compania", key: "compania" },
      { header: "estado", key: "estado" },
    ];
    hoja.addRows(empleados.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      puesto: e.puesto,
      dni: e.dni,
      telefono: e.telefono,
      email: e.email,
      compania: e.compania,
      estado: e.estado,
    })));
  }

  // 🔹 Facturas
  if (facturas.length > 0) {
    const hoja = workbook.addWorksheet("Facturas");
    hoja.columns = [
      { header: "id", key: "id" },
      { header: "monto", key: "monto" },
      { header: "fechaPago", key: "fechaPago" },
      { header: "fechaCarga", key: "fechaCarga" },
      { header: "estado", key: "estado" },
      { header: "clienteId", key: "clienteId" },
    ];

    hoja.addRows(facturas.map((f) => ({
      id: f.id,
      monto: f.monto,
      fechaPago: f.fechaPago.toISOString(),
      fechaCarga: f.fechaCarga.toISOString(),
      estado: f.estado,
      clienteId: f.clienteId,
    })));
  }

  // 🔹 Pagos
  if (pagos.length > 0) {
    const hoja = workbook.addWorksheet("Pagos");
    hoja.columns = [
      { header: "id", key: "id" },
      { header: "fecha", key: "fecha" },
      { header: "tipo", key: "tipo" },
      { header: "monto", key: "monto" },
      { header: "estado", key: "estado" },
      { header: "empleadoId", key: "empleadoId" },
      { header: "empleadorId", key: "empleadorId" },
    ];
    hoja.addRows(pagos.map((p) => ({
      id: p.id,
      fecha: p.fecha.toISOString(),
      tipo: p.tipo,
      monto: p.monto,
      estado: p.estado,
      empleadoId: p.empleadoId,
      empleadorId: p.empleadorId ?? null,
    })));
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new Response(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="backup_datos.xlsx"',
    },
  });
}
