"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import clsx from "clsx";

type EstadoPago = "pendiente" | "pagado" | "retrasado";

type Pago = {
  id: string;
  fecha: string;
  tipo: string;
  nombre: string;
  apellido: string;
  empresa: string;
  dni: string;
  monto: number;
  estado: EstadoPago;
};

export default function PaginaNominas() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [orden, setOrden] = useState<"fecha" | "monto">("fecha");
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<Omit<Pago, "id">>({
    fecha: "",
    tipo: "",
    nombre: "",
    apellido: "",
    empresa: "",
    dni: "",
    monto: 0,
    estado: "pendiente",
  });

  useEffect(() => {
    const guardados = localStorage.getItem("pagos");
    if (guardados) {
      setPagos(JSON.parse(guardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("pagos", JSON.stringify(pagos));
  }, [pagos]);

  const pagosOrdenados = [...pagos].sort((a, b) =>
    orden === "monto"
      ? b.monto - a.monto
      : new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  const pagosPendientes = pagosOrdenados.filter((p) => p.estado === "pendiente");
  const pagosPagados = pagosOrdenados.filter((p) => p.estado === "pagado");
  const pagosRetrasados = pagosOrdenados.filter((p) => p.estado === "retrasado");

  const obtenerUsuarioId = (): number | null => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return typeof payload.sub === "number" ? payload.sub : null;
    } catch {
      console.warn("Token inválido");
      return null;
    }
  };

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const nuevoPago: Pago = {
      id: uuidv4(),
      ...formData,
    };

    setPagos((prev) => [nuevoPago, ...prev]);

    const usuarioId = obtenerUsuarioId();

    try {
      const buscarEmpleado = await fetch(`/api/empleados?dni=${formData.dni}`);
      const existe = buscarEmpleado.status === 200;

      if (!existe) {
        await fetch("/api/empleados", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: formData.nombre,
            apellido: formData.apellido,
            dni: formData.dni,
            empresa: formData.empresa,
            creadoPor: usuarioId,
          }),
        });
      }

      await fetch("/api/pagos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fecha: formData.fecha,
          tipo: formData.tipo,
          monto: formData.monto,
          estado: formData.estado,
          empleadoDni: formData.dni,
        }),
      });
    } catch {
      console.error("Error al guardar el pago o el empleado.");
    }

    setFormData({
      fecha: "",
      tipo: "",
      nombre: "",
      apellido: "",
      empresa: "",
      dni: "",
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

  const actualizarEstado = (id: string, nuevoEstado: EstadoPago) => {
    const actualizado = pagos.map((p) =>
      p.id === id ? { ...p, estado: nuevoEstado } : p
    );
    setPagos(actualizado);
  };

  const formField = (
    label: string,
    name: keyof typeof formData,
    type = "text"
  ) => (
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
        <form
          onSubmit={manejarSubmit}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 border p-4 rounded bg-gray-50"
        >
          {formField("Fecha de pago", "fecha", "date")}
          {formField("Tipo de pago", "tipo")}
          {formField("Nombre del empleado", "nombre")}
          {formField("Apellido del empleado", "apellido")}
          {formField("Empresa", "empresa")}
          {formField("Documento (DNI)", "dni")}
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

  <Tabla titulo="📅 Pagos pendientes" pagos={pagosPendientes} actualizarEstado={actualizarEstado} />
  <Tabla titulo="✅ Pagos realizados" pagos={pagosPagados} actualizarEstado={actualizarEstado} />
  <Tabla titulo="⏰ Pagos retrasados" pagos={pagosRetrasados} actualizarEstado={actualizarEstado} />
</div>
); 
}

type TablaProps = { titulo: string; pagos: Pago[]; actualizarEstado: (id: string, estado: EstadoPago) => void; };

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
              <td className="px-4 py-2">{pago.nombre} {pago.apellido}</td>
              <td className="px-4 py-2">{pago.empresa}</td> <td className="px-4 py-2">{pago.tipo}</td> <td className="px-4 py-2">${pago.monto.toLocaleString()}</td> 
              <td className="px-4 py-2"> 
                <select value={pago.estado} onChange={(e) => actualizarEstado(pago.id, e.target.value as EstadoPago) } className={clsx( "text-xs px-2 py-1 rounded-full font-medium", pago.estado === "pagado" ? "bg-green-100 text-green-700" : pago.estado === "pendiente" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700" )} > 
                  <option value="pendiente">pendiente</option> 
                  <option value="pagado">pagado</option>
                  <option value="retrasado">retrasado</option>
                </select>
              </td>
            </tr>
          )
        )
      }
    </tbody>
  </table>
</div>
</div>
);}

