"use client";

import { useState, useEffect, ChangeEvent } from "react";

export default function AjustesPage() {
  const [formatoFecha, setFormatoFecha] = useState("DD/MM/YYYY");
  const [moneda, setMoneda] = useState("ARS");
  const [temaOscuro, setTemaOscuro] = useState(false);

  useEffect(() => {
    const ajustes = localStorage.getItem("ajustes");
    if (ajustes) {
      const datos = JSON.parse(ajustes);
      setFormatoFecha(datos.formatoFecha || "DD/MM/YYYY");
      setMoneda(datos.moneda || "ARS");
      setTemaOscuro(datos.temaOscuro || false);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "ajustes",
      JSON.stringify({ formatoFecha, moneda, temaOscuro })
    );
  }, [formatoFecha, moneda, temaOscuro]);


  const exportarDatos = () => {
    const todo = { 
      ajustes: localStorage.getItem("ajustes"),
      facturas: localStorage.getItem("facturas"),
      pagos: localStorage.getItem("pagos")
    };
  
    const blob = new Blob([JSON.stringify(todo, null, 2)], {
      type: "application/json",
    });
  
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "datos_backup.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const importarDatos = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const contenido = event.target?.result as string;
        const datos = JSON.parse(contenido);
  
        if (datos.ajustes) localStorage.setItem("ajustes", datos.ajustes);
        if (datos.facturas) localStorage.setItem("facturas", datos.facturas);
        if (datos.pagos) localStorage.setItem("pagos", datos.pagos);
  
        alert("Datos importados correctamente. Recargá la página para ver los cambios.");
      } catch (err) {
        alert("Hubo un error al importar los datos.");
      }
    };
    reader.readAsText(file);
  };

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

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={temaOscuro}
            onChange={(e) => setTemaOscuro(e.target.checked)}
            id="temaOscuro"
          />
          <label htmlFor="temaOscuro" className="text-sm text-gray-600">
            Activar tema oscuro
          </label>
        </div>
      </div>
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-gray-700">Backup de datos</h2>

        <button
          onClick={exportarDatos}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer"
        >
          Exportar datos (.json)
        </button>

        <label className="block mt-4 text-sm text-gray-600">
          Importar archivo (.json)
          <input
            type="file"
            accept=".json"
            onChange={importarDatos}
            className="block mt-1"
          />
        </label>
      </div>
    </div>
  );
}
