"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

type Factura = {
  id: string;
  numero: string;
  concepto: string;
  monto: number;
  cliente: string;
  estado: "pendiente" | "pagada" | "vencida";
  fechaPago: string; // 🟢 ingresada por el usuario
  fechaCarga: string; // 🟢 generada automáticamente
  archivo?: string;
};

type Cliente = {
  dni: string;
  nombre: string;
  apellido: string;
};

export default function PaginaFacturas() {
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [orden, setOrden] = useState<"fecha" | "monto">("fecha");
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<Factura["estado"] | "todos">("todos");

  const [formData, setFormData] = useState<Omit<Factura, "id" | "fechaCarga">>({
    numero: "",
    concepto: "",
    monto: 0,
    fechaPago: "",
    cliente: "",
    estado: "pendiente",
  });

  const [archivoTemp, setArchivoTemp] = useState<string>("");
  const [rolUsuario, setRolUsuario] = useState<"ADMIN" | "USUARIO" | "CLIENTE" | null>(null);
  const [clienteActual, setClienteActual] = useState("");
  const [clientesDisponibles, setClientesDisponibles] = useState<string[]>([]);

  useEffect(() => {
    const data = localStorage.getItem("facturas");
    if (data) setFacturas(JSON.parse(data));

    const clienteData = localStorage.getItem("clientes");
    if (clienteData) {
      const parsed: Cliente[] = JSON.parse(clienteData);
      const lista = parsed.map((c) => `${c.dni} - ${c.nombre} ${c.apellido}`);
      setClientesDisponibles(lista);
    }


    const usuarioData = localStorage.getItem("usuario");
    if (usuarioData) {
      const parsed = JSON.parse(usuarioData);
      setRolUsuario(parsed.rol);
      if (parsed.rol === "CLIENTE") {
        const etiqueta = `${parsed.dni} - ${parsed.nombre} ${parsed.apellido}`;
        setClienteActual(etiqueta);
        setFormData((prev) => ({ ...prev, cliente: etiqueta }));
      }
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

  const manejarArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setArchivoTemp(reader.result as string);
    reader.readAsDataURL(file);
  };

  const manejarSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nueva: Factura = {
      id: uuidv4(),
      ...formData,
      archivo: archivoTemp || undefined,
      fechaCarga: new Date().toISOString(), // 🔄 se genera automáticamente
    };
    setFacturas((prev) => [nueva, ...prev]);
    setFormData({
      numero: "",
      fechaPago: "",
      cliente: "",
      concepto: "",
      monto: 0,
      estado: "pendiente",
    });
    setArchivoTemp("");
    setMostrarFormulario(false);
  };

  const actualizarEstado = (id: string, nuevoEstado: Factura["estado"]) => {
    const actualizadas = facturas.map((f) =>
      f.id === id ? { ...f, estado: nuevoEstado } : f
    );
    setFacturas(actualizadas);
  };

  const actualizarArchivo = (id: string, archivoBase64: string) => {
    const actualizadas = facturas.map((f) =>
      f.id === id ? { ...f, archivo: archivoBase64 } : f
    );
    setFacturas(actualizadas);
  };

  const ordenadas = [...facturas]
    .filter((f) => f.cliente.toLowerCase().includes(filtroCliente.toLowerCase()))
    .filter((f) => filtroEstado === "todos" || f.estado === filtroEstado)
    .sort((a, b) => {
      if (orden === "monto") return b.monto - a.monto;
      return new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime();
  });

  const camposFactura: (keyof typeof formData)[] = ["numero", "fechaPago", "concepto", "monto"];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
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
          {camposFactura.map((field) => (
            <div key={field} className="flex flex-col">
              <label className="text-sm text-gray-600 font-medium capitalize">{field}</label>
              <input
                name={field}
                type={field === "fechaPago" ? "date" : field === "monto" ? "number" : "text"}
                value={formData[field]}
                onChange={manejarCambio}
                className="border px-3 py-1 rounded"
                required
              />
            </div>
          ))}

          {/* Campo cliente */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 font-medium capitalize">cliente</label>
            {rolUsuario === "CLIENTE" ? (
              <input
                name="cliente"
                value={clienteActual}
                disabled
                className="border px-3 py-1 rounded bg-gray-100 text-gray-600"
              />
            ) : (
              <select
                name="cliente"
                value={formData.cliente}
                onChange={manejarCambio}
                className="border px-3 py-1 rounded"
                required
              >
                <option value="">Seleccionar cliente</option>
                {clientesDisponibles.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            )}
          </div>

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

          <div className="flex flex-col sm:col-span-2 lg:col-span-3">
            <label className="text-sm text-gray-600 font-medium">Adjuntar archivo</label>
            <input type="file" accept=".pdf,.jpg,.png" onChange={manejarArchivo} className="border px-3 py-1 rounded" />
          </div>

          <div className="sm:col-span-2 lg:col-span-3 text-right">
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Guardar</button>
          </div>
        </form>
      )}

      {/* Filtros */}
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
              <th className="px-4 py-2">Fecha de carga</th>
              <th className="px-4 py-2">Fecha de pago</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Concepto</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Archivo</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((factura) => (
              <tr key={factura.id} className="border-t">
                <td className="px-4 py-2">{factura.numero}</td>
                <td className="px-4 py-2">{new Date(factura.fechaCarga).toLocaleDateString()}</td>
                <td className="px-4 py-2">{new Date(factura.fechaPago).toLocaleDateString()}</td>
                <td className="px-4 py-2">{factura.cliente}</td>
                <td className="px-4 py-2">{factura.concepto}</td>
                <td className="px-4 py-2">${factura.monto.toLocaleString()}</td>
                <td className="px-4 py-2">
                  <select
                    value={factura.estado}
                    onChange={(e) =>
                      actualizarEstado(factura.id, e.target.value as Factura["estado"])
                    }
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
                <td className="px-4 py-2">
                  {factura.archivo ? (
                    <a
                      href={factura.archivo}
                      download={`factura-${factura.numero}`}
                      className="text-blue-600 underline text-xs"
                    >
                      Ver archivo
                    </a>
                  ) : (
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => {
                          actualizarArchivo(factura.id, reader.result as string);
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="text-xs"
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
