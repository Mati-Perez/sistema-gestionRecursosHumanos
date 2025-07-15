"use client";

import { useState, useEffect } from "react";

const descargarExcel = async () => {
  const res = await fetch("/api/exportar-datos");
  const blob = await res.blob();

  console.log(blob)
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "backup_datos.xlsx";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};


export default function AjustesPage() {
  const [formatoFecha, setFormatoFecha] = useState("DD/MM/YYYY");
  const [moneda, setMoneda] = useState("ARS");
  const [esAdmin, setEsAdmin] = useState(false);
  const [archivoNombre, setArchivoNombre] = useState("");

  useEffect(() => {
    const ajustes = localStorage.getItem("ajustes");
    const local = localStorage.getItem("usuario");

    if (ajustes) {
      const datos = JSON.parse(ajustes);
      setFormatoFecha(datos.formatoFecha || "DD/MM/YYYY");
      setMoneda(datos.moneda || "ARS");
    }

    if (local) {
      const usuario = JSON.parse(local);
      setEsAdmin(usuario.rol === "ADMIN");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "ajustes",
      JSON.stringify({ formatoFecha, moneda })
    );
  }, [formatoFecha, moneda]);
  
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <h1 className="text-3xl font-bold text-blue-700">Ajustes</h1>

      <div className="space-y-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Formato de Fecha</label>
          <select
            value={formatoFecha}
            onChange={(e) => setFormatoFecha(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600">Moneda</label>
          <select
            value={moneda}
            onChange={(e) => setMoneda(e.target.value)}
            className="border px-3 py-1 rounded"
          >
            <option value="ARS">ARS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>

      {esAdmin && (
        <div className="space-y-4 border-t pt-6">
          <h2 className="text-lg font-semibold text-gray-700">Backup de datos</h2>

          <button
            onClick={descargarExcel}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
          >
            Exportar datos (.xslx)
          </button>

          <label className="block mt-4 text-sm text-gray-600 hover: cursor-pointer">
            Importar archivo (.xsls) -
            <input
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              const archivo = e.target.files?.[0];

              if (!archivo) return;

              // 🛡️ Validación MIME
              if (archivo.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
              alert("El archivo debe ser un .xlsx válido");
              return;
              }

              // 🧪 Validación por extensión (extra)
              if (!archivo.name.endsWith(".xlsx")) {
              alert("Extensión inválida. Solo se permite .xlsx");
              return;
              }

              setArchivoNombre(archivo.name);

              const formData = new FormData();
              formData.append("archivo", archivo);
          
              fetch("/api/importar-excel", {
                method: "POST",
                body: formData,
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.ok) {
                    alert("Importación exitosa:\n" + JSON.stringify(data.resumen, null, 2));
                  } else {
                    alert("Error: " + data.error);
                  }
                });
            }}
          />
          {archivoNombre && (
              <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: <span className="font-medium">{archivoNombre}</span></p>
            )}
          </label>
        </div>
      )}
    </div>
  );
}
