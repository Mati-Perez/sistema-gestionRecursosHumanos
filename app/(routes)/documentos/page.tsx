"use client";

import { useEffect, useState, DragEvent } from "react";
import { Download, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

type Documento = {
  id: string;
  nombre: string;
  tipo: string;
  tamaño: number;
  fecha: string;
  contenido: string; // base64
};

export default function DocumentosPage() {
  const [documentos, setDocumentos] = useState<Documento[]>([]);
  const [orden, setOrden] = useState<"nombre" | "fecha">("fecha");

  useEffect(() => {
    const guardados = localStorage.getItem("documentos");
    if (guardados) {
      setDocumentos(JSON.parse(guardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("documentos", JSON.stringify(documentos));
  }, [documentos]);

  const manejarDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const archivos = Array.from(e.dataTransfer.files);

    archivos.forEach((archivo) => {
      const lector = new FileReader();
      lector.onload = () => {
        const contenido = lector.result as string;
        const nuevo: Documento = {
          id: uuidv4(),
          nombre: archivo.name,
          tipo: archivo.type,
          tamaño: archivo.size,
          fecha: new Date().toISOString(),
          contenido,
        };
        setDocumentos((prev) => [nuevo, ...prev]);
      };
      lector.readAsDataURL(archivo);
    });
  };

  const manejarEliminar = (id: string) => {
    if (!confirm("¿Eliminar este documento?")) return;
    setDocumentos((prev) => prev.filter((doc) => doc.id !== id));
  };

  const documentosOrdenados = [...documentos].sort((a, b) => {
    return orden === "nombre"
      ? a.nombre.localeCompare(b.nombre)
      : new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <h1 className="text-3xl font-bold text-blue-700">📄 Documentos</h1>
      <hr />
      <p className="text-gray-600">Arrastrá archivos para cargarlos, o visualizalos acá.</p>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={manejarDrop}
        className="border-2 border-dashed border-blue-300 rounded-md p-8 text-center text-blue-600 bg-blue-50"
      >
        Arrastrá y soltá tus archivos aquí
      </div>

      <div className="flex justify-end gap-2">
        <span className="text-sm text-gray-600">Ordenar por:</span>
        <select
          className="border border-gray-300 rounded px-2 py-1 text-sm"
          value={orden}
          onChange={(e) => setOrden(e.target.value as "nombre" | "fecha")}
        >
          <option value="fecha">Fecha</option>
          <option value="nombre">Nombre</option>
        </select>
      </div>

      <ul className="space-y-3">
        {documentosOrdenados.map((doc) => (
          <li
            key={doc.id}
            className="flex justify-between items-center border rounded p-4 hover:shadow-sm"
          >
            <div className="space-y-1">
              <p className="font-semibold">{doc.nombre}</p>
              <p className="text-sm text-gray-500">
                {new Date(doc.fecha).toLocaleString()} —{" "}
                {(doc.tamaño / 1024).toFixed(1)} KB
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={doc.contenido}
                download={doc.nombre}
                className="text-blue-600 hover:text-blue-800"
                title="Descargar"
              >
                <Download className="w-5 h-5" />
              </a>
              <button
                onClick={() => manejarEliminar(doc.id)}
                title="Eliminar"
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
