"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import Link from "next/link";

type Cliente = {
  id: string;
  nombre: string;
  profesion: string;
  avatarUrl?: string;
  telefono?: string;
  email?: string;
  compania?: string;
};

export default function DetalleCliente() {
  const { id } = useParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [formData, setFormData] = useState<Omit<Cliente, "id">>({
    nombre: "",
    profesion: "",
    avatarUrl: "",
    telefono: "",
    email: "",
    compania: "",
  });

  useEffect(() => {
    const datos = localStorage.getItem("clientes");
    if (!datos) return;

    const lista: Cliente[] = JSON.parse(datos);
    const encontrado = lista.find((c) => c.id === id);
    if (encontrado) {
      setCliente(encontrado);
      setFormData({
        nombre: encontrado.nombre,
        profesion: encontrado.profesion,
        avatarUrl: encontrado.avatarUrl || "",
        telefono: encontrado.telefono || "",
        email: encontrado.email || "",
        compania: encontrado.compania || "",
      });
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const guardarCambios = (e: FormEvent) => {
    e.preventDefault();
    const datos = localStorage.getItem("clientes");
    if (!datos) return;

    const lista: Cliente[] = JSON.parse(datos);
    const actualizado: Cliente = { id: id as string, ...formData };
    const nuevaLista = lista.map((c) => (c.id === id ? actualizado : c));

    localStorage.setItem("clientes", JSON.stringify(nuevaLista));
    setCliente(actualizado);
    setModoEdicion(false);
  };

  const eliminarCliente = () => {
    if (!confirm("¿Estás seguro de que querés eliminar este cliente?")) return;

    const datos = localStorage.getItem("clientes");
    if (!datos) return;

    const lista: Cliente[] = JSON.parse(datos);
    const nuevaLista = lista.filter((c) => c.id !== id);

    localStorage.setItem("clientes", JSON.stringify(nuevaLista));
    router.push("/directorio");
  };

  if (!cliente) {
    return <div className="p-6 text-center text-gray-500">Cliente no encontrado.</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <Link href="/directorio" className="text-blue-600 hover:underline text-sm">
        ← Volver al directorio
      </Link>

      {!modoEdicion ? (
        <>
          <div className="flex flex-col items-center">
            {cliente.avatarUrl ? (
              <Image
                src={cliente.avatarUrl}
                alt={cliente.nombre}
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="text-gray-500 w-6 h-6" />
              </div>
            )}
            <h1 className="text-2xl font-bold mt-4">{cliente.nombre}</h1>
            <p className="text-gray-600">{cliente.profesion}</p>
          </div>

          <div className="grid gap-3 text-sm text-gray-700">
            <p><span className="font-semibold">Compañía:</span> {cliente.compania || "—"}</p>
            <p><span className="font-semibold">Teléfono:</span> {cliente.telefono || "—"}</p>
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {cliente.email ? (
                <a href={`mailto:${cliente.email}`} className="text-blue-600 hover:underline">
                  {cliente.email}
                </a>
              ) : (
                "—"
              )}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setModoEdicion(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Editar
            </button>
            <button
              onClick={eliminarCliente}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Eliminar
            </button>
          </div>
        </>
      ) : (
        <form onSubmit={guardarCambios} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              name="nombre"
              placeholder="Nombre"
              value={formData.nombre}
              onChange={manejarCambio}
              required
              className="border px-3 py-2 rounded"
            />
            <input
              name="profesion"
              placeholder="Profesión"
              value={formData.profesion}
              onChange={manejarCambio}
              required
              className="border px-3 py-2 rounded"
            />
            <input
              name="telefono"
              placeholder="Teléfono"
              value={formData.telefono}
              onChange={manejarCambio}
              className="border px-3 py-2 rounded"
            />
            <input
              name="email"
              placeholder="Correo electrónico"
              value={formData.email}
              onChange={manejarCambio}
              className="border px-3 py-2 rounded"
            />
            <input
              name="compania"
              placeholder="Compañía"
              value={formData.compania}
              onChange={manejarCambio}
              className="border px-3 py-2 rounded"
            />
            <input
              name="avatarUrl"
              placeholder="URL del avatar"
              value={formData.avatarUrl}
              onChange={manejarCambio}
              className="border px-3 py-2 rounded"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModoEdicion(false)}
              className="px-4 py-2 border rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Guardar cambios
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
