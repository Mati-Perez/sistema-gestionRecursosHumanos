"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

type Pago = {
  id: string;
  fecha: string;
  tipo: string;
  empleado: string;
  empresa: string;
  monto: number;
  estado: "pendiente" | "pagado" | "retrasado";
};

export default function PaginaNominas() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [orden, setOrden] = useState<"fecha" | "monto">("fecha");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<Omit<Pago, "id">>({
    fecha: "",
    tipo: "",
    empleado: "",
    empresa: "",
    monto: 0,
    estado: "pendiente",
  });

  useEffect(() => {
    const guardados = localStorage.getItem("pagos");
    if (guardados) {
      setPagos(JSON.parse(guardados));
    } else {
      const ejemplo: Pago[] = [
        {
          id: uuidv4(),
          fecha: "2025-07-10",
          tipo: "Transferencia",
          empleado: "Valentina Rojas",
          empresa: "ArquiEstudio",
          monto: 280000,
          estado: "pendiente",
        },
        {
          id: uuidv4(),
          fecha: "2025-06-05",
          tipo: "Efectivo",
          empleado: "Lucas Fernández",
          empresa: "TechLoop",
          monto: 320000,
          estado: "pagado",
        },
        {
          id: uuidv4(),
          fecha: "2025-06-15",
          tipo: "Transferencia",
          empleado: "Juan Pérez",
          empresa: "Pérez & Asociados",
          monto: 250000,
          estado: "retrasado",
        },
      ];
      localStorage.setItem("pagos", JSON.stringify(ejemplo));
      setPagos(ejemplo);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pagos", JSON.stringify(pagos));
  }, [pagos]);

  const pagosOrdenados = [...pagos].sort((a, b) => {
    if (orden === "monto") return b.monto - a.monto;
    return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
  });

  

  const pagosFuturos = pagosOrdenados.filter((p) => p.estado === "pendiente");
  const pagosHistoricos = pagosOrdenados.filter((p) => p.estado !== "pendiente");

  const manejarSubmit = (e: FormEvent) => {
    e.preventDefault();
    const nuevo: Pago = {
      id: uuidv4(),
      ...formData,
    };
    setPagos((prev) => [nuevo, ...prev]);
    setFormData({
      fecha: "",
      tipo: "",
      empleado: "",
      empresa: "",
      monto: 0,
      estado: "pendiente",
    });
    setMostrarFormulario(false);
  };

  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "monto" ? Number(value) : value,
    }));
  };

  const formField = (label: string, name: keyof typeof formData, type = "text") => (
    <div className="flex flex-col">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={manejarCambio}
        className="border px-3 py-1 rounded"
        required={name !== "estado"}
      />
    </div>
  );
  /*
  const celdaEstado = (estado: Pago["estado"]) => {
    const color =
      estado === "pagado"
        ? "bg-green-100 text-green-700"
        : estado === "pendiente"
        ? "bg-gray-100 text-gray-700"
        : "bg-red-100 text-red-700";
    return (
      <span className={clsx("text-xs px-2 py-1 rounded-full font-medium", color)}>
        {estado}
      </span>
    );
  };*/

  const actualizarEstado = (id: string, nuevoEstado: Pago["estado"]) => {
    const actualizado = pagos.map((pago) =>
      pago.id === id ? { ...pago, estado: nuevoEstado } : pago
    );
    setPagos(actualizado);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Nóminas</h1>
          <p className="text-gray-600">Seguimiento de pagos a empleados</p>
        </div>
        <button
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Nuevo pago"}
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={manejarSubmit} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded bg-gray-50">
          {formField("Fecha de pago", "fecha", "date")}
          {formField("Tipo de pago", "tipo")}
          {formField("Empleado", "empleado")}
          {formField("Empresa", "empresa")}
          {formField("Monto", "monto", "number")}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-600">Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={manejarCambio}
              className="border px-3 py-1 rounded"
            >
              <option value="pendiente">pendiente</option>
              <option value="pagado">pagado</option>
              <option value="retrasado">retrasado</option>
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

      <Tabla titulo="📅 Próximos pagos" pagos={pagosFuturos}  actualizarEstado={actualizarEstado}/>
      <Tabla titulo="🕘 Pagos realizados" pagos={pagosHistoricos}  actualizarEstado={actualizarEstado}/>
    </div>
  );
}

type TablaProps = {
  titulo: string;
  pagos: Pago[];
  actualizarEstado: (id: string, estado: Pago["estado"]) => void;
};

function Tabla({ titulo, pagos, actualizarEstado }: TablaProps) {
  if (pagos.length === 0) return null;
  return (
    <div className="dark:bg-zinc-900 border-b dark:border-zinc-700">
      <h2 className="text-lg font-semibold mb-2">{titulo}</h2>
      <div className="overflow-x-auto border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Empleado</th>
              <th className="px-4 py-2">Empresa</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Monto</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago.id} className="border-t">
                <td className="px-4 py-2">{new Date(pago.fecha).toLocaleDateString()}</td>
                <td className="px-4 py-2">{pago.empleado}</td>
                <td className="px-4 py-2">{pago.empresa}</td>
                <td className="px-4 py-2">{pago.tipo}</td>
                <td className="px-4 py-2">${pago.monto.toLocaleString()}</td> 
                <td className="px-4 py-2">
                  <select
                    value={pago.estado}
                    onChange={(e) => actualizarEstado(pago.id, e.target.value as Pago["estado"])}
                    className={clsx(
                      "text-xs px-2 py-1 rounded-full font-medium",
                      pago.estado === "pagado"
                        ? "bg-green-100 text-green-700"
                        : pago.estado === "pendiente"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    )}>
                    <option value="pendiente">pendiente</option>
                    <option value="pagado">pagado</option>
                    <option value="retrasado">retrasado</option>
                  </select>
                </td>
              </tr> 
            ))
          } 
        </tbody> 
      </table> 
    </div> 
  </div> ); 
}


