"use client";

import { useEffect, useState, ChangeEvent, FormEvent, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Usuario, Rol } from "@prisma/client";
import Image from "next/image";
import { toast } from "sonner";

type FormUsuario = {
  nombre: string;
  email: string;
  fotoUrl?: string;
  rol: Rol;
  estado: boolean;
};

export default function DetalleUsuario() {
  const { id } = useParams();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<FormUsuario>({
    nombre: "",
    email: "",
    fotoUrl: "",
    rol: Rol.USUARIO,
    estado: true,
  });

  const cargarDesdeAPI = useCallback(async () => {
    try {
      const res = await fetch(`/api/usuarios/${id}`);
      const data = await res.json();

      if (data.error) {
        toast.error("Error al cargar usuario", { description: data.error });
      } else {
        setUsuario(data);
        setFormData({
          nombre: data.nombre,
          email: data.email,
          fotoUrl: data.fotoUrl || "",
          rol: data.rol,
          estado: data.estado,
        });
        localStorage.setItem(`usuario-${id}`, JSON.stringify(data));
      }
    } catch {
      toast.error("Error de red");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const local = localStorage.getItem(`usuario-${id}`);
    if (local) {
      const cache = JSON.parse(local);
      setUsuario(cache);
      setFormData({
        nombre: cache.nombre,
        email: cache.email,
        fotoUrl: cache.fotoUrl || "",
        rol: cache.rol,
        estado: cache.estado,
      });
      setLoading(false);
    } else {
      cargarDesdeAPI();
    }
  }, [id, cargarDesdeAPI]);

  const manejarCambio = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const guardarCambios = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (res.ok) {
      setUsuario(data);
      setModoEdicion(false);
      toast.success("Usuario actualizado");
      localStorage.setItem(`usuario-${id}`, JSON.stringify(data));
    } else {
      toast.error("Error al actualizar usuario", {
        description: data.error || "Desconocido",
      });
    }
  };

  const eliminarUsuario = async () => {
    if (!confirm("¿Querés desactivar este usuario?")) return;

    const res = await fetch(`/api/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: false }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Usuario desactivado");
      localStorage.removeItem(`usuario-${id}`);
      router.push("/usuarios");
    } else {
      toast.error("Error al desactivar usuario", {
        description: data.error || "Desconocido",
      });
    }
  };

  const actualizarManual = () => {
    localStorage.removeItem(`usuario-${id}`);
    setLoading(true);
    cargarDesdeAPI();
  };

  if (loading)
    return <div className="p-6 text-center text-gray-500">Cargando usuario...</div>;

  if (!usuario)
    return <div className="p-6 text-center text-red-500">Usuario no encontrado.</div>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow space-y-6 dark:bg-zinc-900">
      <button
        onClick={() => router.push("/usuarios")}
        className="text-blue-600 hover:underline text-sm"
      >
        ← Volver a usuarios
      </button>
  
      <div className="flex justify-center pt-2">
        <button
          onClick={actualizarManual}
          className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded-md"
        >
          🔄 Actualizar usuario
        </button>
      </div>
  
      {!modoEdicion ? (
        <>
          <div className="flex flex-col items-center">
            {usuario.fotoUrl ? (
              <Image
                src={usuario.fotoUrl}
                alt={usuario.nombre}
                width={96}
                height={96}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-500">👤</span>
              </div>
            )}
            <h1 className="text-2xl font-bold mt-4">{usuario.nombre}</h1>
            <p className="text-gray-600">{usuario.rol}</p>
          </div>
  
          <div className="grid gap-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Email:</span>{" "}
              {usuario.email ? (
                <a
                  href={`mailto:${usuario.email}`}
                  className="text-blue-600 hover:underline"
                >
                  {usuario.email}
                </a>
              ) : (
                "—"
              )}
            </p>
            <p>
              <span className="font-semibold">Estado:</span>{" "}
              {usuario.estado ? "Activo" : "Desactivado"}
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
              onClick={eliminarUsuario}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Desactivar
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
              name="email"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={manejarCambio}
              required
              className="border px-3 py-2 rounded"
            />
            <input
              name="fotoUrl"
              placeholder="Foto URL"
              value={formData.fotoUrl || ""}
              onChange={manejarCambio}
              className="border px-3 py-2 rounded"
            />
            <select
              name="rol"
              value={formData.rol}
              onChange={manejarCambio}
              className="border px-3 py-2 rounded"
            >
              {Object.values(Rol).map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 col-span-2">
              <input
                type="checkbox"
                name="estado"
                checked={formData.estado}
                onChange={manejarCambio}
              />
              Activo
            </label>
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
