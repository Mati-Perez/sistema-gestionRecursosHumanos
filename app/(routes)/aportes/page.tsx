

const clienteEjemplo = {
  razonSocial: "Constructora del Sol",
  cuit: "30-71234567-8",
  empleados: [
    { id: 1, nombre: "Juan Pérez", dni: "12345678", puesto: "Albañil" },
    { id: 2, nombre: "Lucía Gómez", dni: "23456789", puesto: "Administrativa" },
  ],
  vencimientos: [
    { tipo: "Cargas Sociales", fecha: "2025-07-10", estado: "pendiente" },
    { tipo: "Cargas Sindicales", fecha: "2025-07-15", estado: "cumplido" },
    { tipo: "Declaración Jurada", fecha: "2025-07-18", estado: "pendiente" },
  ],
};


import { BadgeCheck, AlertCircle } from "lucide-react";

export default function PanelClienteAportes() {
  const { razonSocial, cuit, empleados, vencimientos } = clienteEjemplo;

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white dark:bg-zinc-900 rounded-lg shadow space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-blue-700">{razonSocial}</h1>
        <p className="text-sm text-gray-600">CUIT: {cuit}</p>
      </header>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">👥 Empleados</h2>
        <ul className="mt-2 grid sm:grid-cols-2 gap-3">
          {empleados.map((emp) => (
            <li key={emp.id} className="border p-3 rounded-md bg-gray-50 dark:bg-zinc-800">
              <p className="font-medium">{emp.nombre}</p>
              <p className="text-sm text-gray-500">DNI: {emp.dni}</p>
              <p className="text-sm text-gray-500">Puesto: {emp.puesto ?? "Sin asignar"}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">📅 Vencimientos</h2>
        <div className="mt-2 space-y-3">
          {vencimientos.map((venc, index) => (
            <div key={index} className="border p-4 rounded-md bg-gray-50 dark:bg-zinc-800 flex items-center justify-between">
              <div>
                <p className="font-semibold">{venc.tipo}</p>
                <p className="text-sm text-gray-500">
                  Fecha: {new Date(venc.fecha).toLocaleDateString("es-AR", { day: "numeric", month: "long", weekday: "long" })}
                </p>
              </div>
              <span
                className={`text-sm px-3 py-1 rounded-full font-medium flex items-center gap-1 ${
                  venc.estado === "cumplido"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {venc.estado === "cumplido" ? <BadgeCheck className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                {venc.estado.charAt(0).toUpperCase() + venc.estado.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
