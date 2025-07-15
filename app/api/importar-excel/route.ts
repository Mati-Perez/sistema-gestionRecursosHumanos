import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const formData = await req.formData();
  const archivo = formData.get("archivo") as File;
  if (!archivo) {
    return NextResponse.json({ error: "No se recibió el archivo" }, { status: 400 });
  }

  const bytes = await archivo.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const workbook = XLSX.read(buffer, { type: "buffer" });

  const hojasImportadas = {
    Usuarios: 0,
    Clientes: 0,
    Empleados: 0,
    Facturas: 0,
    Pagos: 0,
  };

  const importarHoja = async (nombre: keyof typeof hojasImportadas, modelo: keyof typeof prisma) => {
    const hoja = workbook.Sheets[nombre];
    if (!hoja) return;

    const datos = XLSX.utils.sheet_to_json<Record<string, any>>(hoja);
    for (const fila of datos) {
      try {
        await prisma[modelo].create({ data: fila });
        hojasImportadas[nombre]++;
      } catch (error) {
        console.error(`Error al importar ${nombre}:`, error);
        // Podés loguear errores individuales o agregarlos a un array
      }
    }
  };

  await importarHoja("Usuarios", "usuario");
  await importarHoja("Clientes", "cliente");
  await importarHoja("Empleados", "empleado");
  await importarHoja("Facturas", "factura");
  await importarHoja("Pagos", "pago");

  return NextResponse.json({
    ok: true,
    resumen: hojasImportadas,
  });
}
