"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

type Factura = {
  id: string;
  numero: string;
  fecha: string;
  cliente: string;
  concepto: string;
  monto: number;
  estado: "pendiente" | "pagada" | "vencida";
};

export default function PaginaFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [orden, setOrden] = useState<"fecha" | "monto">("fecha");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Factura["estado"] | "todos">("todos");

  const [formData, setFormData] = useState<Omit<Factura, "id">>({
    numero: "",
    fecha: "",
    cliente: "",
    concepto: "",
    monto: 0,
    estado: "pendiente",
  });

  useEffect(() => {
    const data = localStorage.getItem("facturas");
    if (data) {
      setFacturas(JSON.parse(data));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("facturas", JSON.stringify(facturas));
  }, [facturas]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monto" ? Number(value) : value,
    }));
  };

  const manejarSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nueva = { id: uuidv4(), ...formData };
    setFacturas((prev) => [nueva, ...prev]);
    setFormData({ numero: "", fecha: "", cliente: "", concepto: "", monto: 0, estado: "pendiente" });
    setMostrarFormulario(false);
  };

  const actualizarEstado = (id: string, nuevoEstado: Factura["estado"]) => {
    const actualizadas = facturas.map((f) =>
      f.id === id ? { ...f, estado: nuevoEstado } : f
    );
    setFacturas(actualizadas);
  };

  const ordenadas = [...facturas]
  .filter((f) =>
    f.cliente.toLowerCase().includes(filtroCliente.toLowerCase())
  )
  .filter((f) => filtroEstado === "todos" || f.estado === filtroEstado)
  .sort((a, b) => {
    if (orden === "monto") return b.monto - a.monto;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-indigo-700">Facturas</h1>
          <p className="text-gray-600">Control y emisión de facturación</p>
        </div>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Nueva factura"}
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={manejarSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 bg-gray-50 rounded">
          {["numero", "fecha", "cliente", "concepto", "monto"].map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm text-gray-600 font-medium capitalize">{field}</label>
              <input
                name={field}
                type={field === "fecha" ? "date" : field === "monto" ? "number" : "text"}
                value={(formData as any)[field]}
                onChange={manejarCambio}
                className="border px-3 py-1 rounded"
                required
              />
            </div>
          ))}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 font-medium">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={manejarCambio}
              className="border px-3 py-1 rounded"
            >
              <option value="pendiente">pendiente</option>
              <option value="pagada">pagada</option>
              <option value="vencida">vencida</option>
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 text-right">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Guardar
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-end items-center gap-2">
        <label className="text-sm text-gray-600">Ordenar por:</label>
        <select
          value={orden}
          onChange={(e) => setOrden(e.target.value as "fecha" | "monto")}
          className="border px-2 py-1 text-sm rounded"
        >
          <option value="fecha">Fecha</option>
          <option value="monto">Monto</option>
        </select>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-4">
  <div className="flex flex-col">
    <label className="text-sm text-gray-600">Filtrar por cliente</label>
    <input
      type="text"
      value={filtroCliente}
      onChange={(e) => setFiltroCliente(e.target.value)}
      placeholder="Ej: Acme S.A."
      className="border px-3 py-1 rounded"
    />
  </div>

    <div className="flex flex-col">
        <label className="text-sm text-gray-600">Filtrar por estado</label>
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as Factura["estado"] | "todos")}
          className="border px-3 py-1 rounded"
        >
          <option value="todos">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="pagada">Pagada</option>
          <option value="vencida">Vencida</option>
        </select>
      </div>
    </div>

      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">N°</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Concepto</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((factura) => (
              <tr key={factura.id} className="border-t">
                <td className="px-4 py-2">{factura.numero}</td>
                <td className="px-4 py-2">{new Date(factura.fecha).toLocaleDateString()}</td>
                <td className="px-4 py-2">{factura.cliente}</td>
                <td className="px-4 py-2">{factura.concepto}</td>
                <td className="px-4 py-2">${factura.monto.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <select
                    value={factura.estado}
                    onChange={(e) => actualizarEstado(factura.id, e.target.value as Factura["estado"])}
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      factura.estado === "pagada"
                        ? "bg-green-100 text-green-700"
                        : factura.estado === "pendiente"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    <option value="pendiente">pendiente</option>
                    <option value="pagada">pagada</option>
                    <option value="vencida">vencida</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
