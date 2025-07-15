"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

type Usuario = {
  id: number
  nombre: string
  email?: string
  fotoUrl?: string
}

const USUARIOS_POR_PAGINA = 15

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [filtro, setFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)

  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    rol: "USUARIO",
    fotoUrl: ""
  })
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    const cache = localStorage.getItem("usuarios-caché");
  
    if (cache) {
      const data = JSON.parse(cache);
      const todos = data.usuarios;
  
      const filtrados = todos.filter((u: Usuario) => {
        const buscado = filtro.toLowerCase();
        return (
          u.nombre.toLowerCase().includes(buscado) ||
          u.email?.toLowerCase().includes(buscado)
        );
      });
  
      const inicio = (paginaActual - 1) * USUARIOS_POR_PAGINA;
      const pagina = filtrados.slice(inicio, inicio + USUARIOS_POR_PAGINA);
  
      setUsuarios(pagina);
      setTotalPaginas(Math.max(1, Math.ceil(filtrados.length / USUARIOS_POR_PAGINA)));
    } else {
      cargarDesdeAPI();
    }
  }, [paginaActual, filtro]);

  const cargarDesdeAPI = async () => {
    try {
      const res = await fetch("/api/usuarios?rol=USUARIO&pagina=1");
      const data = await res.json();
      localStorage.setItem("usuarios-caché", JSON.stringify(data));
      setUsuarios(data.usuarios); // 👈 ACTUALIZA el listado
      setTotalPaginas(Math.max(1, Math.ceil(data.total / USUARIOS_POR_PAGINA)));
      setPaginaActual(1);
      setFiltro(""); // opcional
    } catch (err) {
      console.error("Error al cargar usuarios desde la API:", err);
    }
  };
  
  const manejarCambio = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrores((prev) => ({ ...prev, [e.target.name]: "" }))
  }

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const nuevosErrores: Record<string, string> = {}
    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio"
    if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email))
      nuevosErrores.email = "Correo electrónico inválido"

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const nuevo = await res.json()
        setUsuarios((prev) => [nuevo, ...prev])
        if (!filtro && paginaActual === 1) {
          const actualizado = [{ ...nuevo }, ...usuarios];
          localStorage.setItem("usuarios-caché", JSON.stringify({
            usuarios: actualizado,
            total: actualizado.length
          }));
        }
        setFormData({ nombre: "", email: "", rol: "USUARIO", fotoUrl: "" })
        setErrores({})
        setMostrarFormulario(false)
        toast.success("Usuario creado exitosamente", {
          description: `${formData.nombre} fue agregado`,
        })
        setPaginaActual(1)
        setFiltro("")
      } else {
        const body = await res.json()
        if (res.status === 409) {
          toast.error("Ese correo ya está registrado", {
            description: "Intentá con otro email o editá el existente",
          })
        } else {
          toast.error("Error al crear usuario", {
            description: body.error || "Verificá los datos e intentá nuevamente",
          })
        }
      }
    } catch (err) {
      console.error("Error al enviar:", err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-700">Usuarios</h1>
          <p className="text-gray-600">Miembros registrados con rol usuario</p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Nuevo usuario"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-full max-w-md items-center border border-gray-300 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 mr-2.5 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por nombre o email..."
            className="w-full border-0 focus:outline-none"
            value={filtro}
            onChange={(e) => {
              setFiltro(e.target.value)
              setPaginaActual(1)
            }}
          />
        </div>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={manejarSubmit}
          className="bg-gray-100 p-6 rounded-md space-y-4 border"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Input
                name="nombre"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={manejarCambio}
                className={errores.nombre ? "border-red-500" : ""}
                required
              />
              {errores.nombre && (
                <p className="text-red-500 text-sm mt-1">{errores.nombre}</p>
              )}
            </div>

            <div>
              <Input
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={manejarCambio}
                className={errores.email ? "border-red-500" : ""}
              />
              {errores.email && (
                <p className="text-red-500 text-sm mt-1">{errores.email}</p>
              )}
            </div>

            <select
              name="rol"
              value={formData.rol}
              onChange={manejarCambio}
              className="w-full border px-3 py-2 rounded"
            >
              <option value="USUARIO">USUARIO</option>
              <option value="ADMIN">ADMIN</option>
              <option value="CLIENTE">CLIENTE</option>
            </select>

            <Input
              name="fotoUrl"
              placeholder="URL de avatar (opcional)"
              value={formData.fotoUrl}
              onChange={manejarCambio}
            />
          </div>

          <div className="text-right">
            <button
              type="submit"
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Guardar usuario
            </button>
          </div>
        </form>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            localStorage.removeItem("usuarios-caché");
            setPaginaActual(1);
            setFiltro("");
          }}
          className="bg-gray-200 h-10 hover:bg-gray-300 cursor-pointer text-sm px-3 py-1 rounded-md"
        >
          🔄 Actualizar listado
        </button>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {usuarios.map((usuario) => (
          <Link
            key={usuario.id}
            href={`/usuario/${usuario.id}`}
            className="flex items-center gap-4 p-4 border rounded hover:shadow cursor-pointer"
          >
            {usuario.fotoUrl ? (
              <Image
                src={usuario.fotoUrl}
                alt={usuario.nombre}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <User className="w-5 h-5" />
              </div>
            )}
            <div>
              <p className="font-semibold">{usuario.nombre}</p>
              <p className="text-sm text-gray-500">{usuario.email}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="flex justify-center gap-2 pt-4">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded ${
              paginaActual === i + 1 ? "bg-purple-600 text-white" : "bg-white text-gray-700"
            }`}
            onClick={() => setPaginaActual(i + 1)}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
