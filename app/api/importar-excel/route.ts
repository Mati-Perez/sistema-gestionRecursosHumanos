import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { EstadoFactura } from "@prisma/client";

// Tipos por hoja
type UsuarioFila = {
  nombre: string;
  email: string;
  rol: "ADMIN" | "CLIENTE";
  password: string;
};

type ClienteFila = {
  nombre: string;
  email: string;
  telefono?: string;
  razonSocial: string;
  compania: string;
  cuit: string;
  dni: string;
  apellido: string;
  profesion: string;
  usuarioId: number;
};

type EmpleadoFila = {
  nombre: string;
  apellido: string;
  puesto: string;
  email: string;
  dni: string;
  clienteId: number;
};

type FacturaFila = {
  clienteId: number;
  monto: number;
  fechaPago: string;     
  estado: string;          
};

type PagoFila = {
  facturaId: number;
  monto: number;
  metodo: string;
  tipo: string;
  fecha: string;
  empleadoId: number;
};

// Procesadores por hoja
const procesadores = {
  Usuarios: async (fila: UsuarioFila) => {
    await prisma.usuario.create({ data: fila });
  },

  Clientes: async (fila: ClienteFila) => {
    await prisma.cliente.create({
      data: {
        nombre: fila.nombre,
        email: fila.email,
        telefono: fila.telefono ?? "",
        razonSocial: fila.razonSocial,
        compania: fila.compania,
        cuit: fila.cuit,
        dni: fila.dni,
        apellido: fila.apellido,
        profesion: fila.profesion,
        usuario: {
          connect: { id: fila.usuarioId } // si tiene relación directa con Usuario
        },
      },
    });
  },

  Empleados: async (fila: EmpleadoFila) => {
    await prisma.empleado.create({
      data: {
        nombre: fila.nombre,
        apellido: fila.apellido,
        puesto: fila.puesto,
        email: fila.email,
        dni: fila.dni,
        cliente: {
          connect: { id: fila.clienteId },
        },
      },
    });
  },

  Facturas: async (fila: FacturaFila) => {
    await prisma.factura.create({
      data: {
        clienteId: fila.clienteId,
        monto: fila.monto,
        fechaPago: new Date(fila.fechaPago),
        estado: fila.estado as EstadoFactura,
        fechaCarga: new Date(), // 👈 Se genera en este momento
      },
    });
  },

  Pagos: async (fila: PagoFila) => {
  await prisma.pago.create({
    data: {
      monto: fila.monto,
      tipo: fila.tipo,
      fecha: new Date(fila.fecha),
      empleadoId: fila.empleadoId,
    },
  });
},
};

export async function POST(req: Request) {
  const formData = await req.formData();
  const archivo = formData.get("archivo") as File;

  if (!archivo) {
    return NextResponse.json({ error: "No se recibió el archivo" }, { status: 400 });
  }

  const buffer = Buffer.from(await archivo.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const resumen = {
    Usuarios: 0,
    Clientes: 0,
    Empleados: 0,
    Facturas: 0,
    Pagos: 0,
  };

  for (const hojaNombre of Object.keys(resumen) as Array<keyof typeof resumen>) {
    const hoja = workbook.Sheets[hojaNombre];
    if (!hoja) continue;

    const datos = XLSX.utils.sheet_to_json(hoja);

    for (const fila of datos) {
      try {
        // Ejecutar el procesador específico
        await procesadores[hojaNombre](fila as never);
        resumen[hojaNombre]++;
      } catch (error) {
        console.error(`Error en ${hojaNombre}`, error);
      }
    }
  }

  return NextResponse.json({ ok: true, resumen });
}
