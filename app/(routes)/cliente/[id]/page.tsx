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

  const cargarDesdeApi = async () => {
    const res = await fetch(`/api/clientes/${id}`);
    const data = await res.json();
    setCliente(data);
    localStorage.setItem(`cliente-${id}`, JSON.stringify(data));
    setFormData({
      nombre: data.nombre,
      profesion: data.profesion,
      avatarUrl: data.avatarUrl || "",
      telefono: data.telefono || "",
      email: data.email || "",
      compania: data.compania || "",
    });
  };

  useEffect(() => {
    const local = localStorage.getItem(`cliente-${id}`);
    if (local) {
      const clienteGuardado = JSON.parse(local);
      setCliente(clienteGuardado);
      setFormData({
        nombre: clienteGuardado.nombre,
        profesion: clienteGuardado.profesion,
        avatarUrl: clienteGuardado.avatarUrl || "",
        telefono: clienteGuardado.telefono || "",
        email: clienteGuardado.email || "",
        compania: clienteGuardado.compania || "",
      });
    } else {
      cargarDesdeApi();
    }
  }, [id]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const guardarCambios = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/clientes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      const actualizado = await res.json();
      setCliente(actualizado);
      setModoEdicion(false);
      localStorage.setItem(`cliente-${id}`, JSON.stringify(actualizado)); // 💾 actualizar caché
    }
  };

  const eliminarCliente = async () => {
    const confirmar = confirm("¿Estás seguro de que querés eliminar este cliente?");
    if (!confirmar) return;

    const res = await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    if (res.ok) {
      localStorage.removeItem(`cliente-${id}`); // 🧹 limpiar caché
      router.push("/directorio");
    }
  };

  const actualizarManual = () => {
    localStorage.removeItem(`cliente-${id}`);
    cargarDesdeApi();
  };

  if (!cliente) {
    return (
      <div className="p-6 text-center text-gray-500">
        Cargando cliente...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <Link href="/" className="text-blue-600 hover:underline text-sm">
        ← Volver al directorio
      </Link>

      <div className="flex justify-center pt-2">
        <button
          onClick={actualizarManual}
          className="bg-gray-200 h-10 hover:bg-gray-300 cursor-pointer text-sm px-3 py-1 rounded-md"
        >
          🔄 Actualizar cliente
        </button>
      </div>

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
