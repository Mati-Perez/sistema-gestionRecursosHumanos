"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from 'sonner'
import Link from "next/link"
import Image from "next/image"

type Cliente = {
  id: string
  nombre: string
  profesion: string
  avatarUrl?: string
  telefono?: string
  email?: string
  compania?: string
}

const CLIENTES_POR_PAGINA = 15

export default function Directorio() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [filtro, setFiltro] = useState("")
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalPaginas, setTotalPaginas] = useState(1)
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [formData, setFormData] = useState<Omit<Cliente, "id">>({
    nombre: "",
    profesion: "",
    avatarUrl: "",
    telefono: "",
    email: "",
    compania: ""
  })
  const [errores, setErrores] = useState<Record<string, string>>({})

  useEffect(() => {
    const cargarClientes = async () => {
      const cache = localStorage.getItem("clientes");
      if (cache && !filtro && paginaActual === 1) {
        const data: Cliente[] = JSON.parse(cache);
        setClientes(data); // ← ya es el array directamente
        setTotalPaginas(Math.ceil(data.length / CLIENTES_POR_PAGINA)); // asumimos que hay que calcular así
        return;
      }
      try {
        const res = await fetch(`/api/clientes?pagina=${paginaActual}&filtro=${encodeURIComponent(filtro)}`);
        const data = await res.json();
        setClientes(data.clientes);
        setTotalPaginas(Math.ceil(data.total / CLIENTES_POR_PAGINA));
  
        // Solo cacheamos si no hay filtro y es la primera página
        if (!filtro && paginaActual === 1) {
          localStorage.setItem("clientes", JSON.stringify(data.clientes));
        }
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      }
    };
  
    cargarClientes();
  }, [paginaActual, filtro]);

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrores((prev) => ({ ...prev, [e.target.name]: "" }))
  }

  const manejarSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nuevosErrores: Record<string, string> = {}

    if (!formData.nombre.trim()) nuevosErrores.nombre = "El nombre es obligatorio"
    if (!formData.profesion.trim()) nuevosErrores.profesion = "La profesión es obligatoria"
    if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,}$/.test(formData.email))
      nuevosErrores.email = "Correo electrónico inválido"

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    try {
      const res = await fetch("/api/clientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const nuevo = await res.json()
        setClientes((prev) => [nuevo, ...prev])
        setFormData({
          nombre: "",
          profesion: "",
          avatarUrl: "",
          telefono: "",
          email: "",
          compania: ""
        })
        setErrores({})
        setMostrarFormulario(false)
        toast.success("Cliente guardado exitosamente", {
          description: `${formData.nombre} fue agregado al directorio`,
        })
        setPaginaActual(1)
        setFiltro("")
      } else {
        console.error("Error al crear cliente:", await res.text())
      }
    } catch (err) {
      console.error("Error al enviar:", err)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Clientes</h1>
          <p className="text-gray-600">Contactá con tus clientes</p>
        </div>
        <button
          onClick={() => setMostrarFormulario((v) => !v)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {mostrarFormulario ? "Cancelar" : "+ Nuevo cliente"}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex w-full max-w-md items-center border border-gray-300 rounded-lg px-3 py-2">
          <Search className="h-4 w-4 mr-2.5 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar por nombre o profesión..."
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
                name="profesion"
                placeholder="Profesión"
                value={formData.profesion}
                onChange={manejarCambio}
                className={errores.profesion ? "border-red-500" : ""}
                required
              />
              {errores.profesion && (
                <p className="text-red-500 text-sm mt-1">{errores.profesion}</p>
              )}
            </div>

            <Input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={manejarCambio} />

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

            <Input name="compania" placeholder="Compañía" value={formData.compania} onChange={manejarCambio} />
            <Input name="avatarUrl" placeholder="URL de avatar (opcional)" value={formData.avatarUrl} onChange={manejarCambio} />
          </div>

          <div className="text-right">
            <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer">
              Guardar cliente
            </button>
          </div>
        </form>
      )}
      <div className="flex justify-center pt-2">
      <button
        onClick={() => {
          localStorage.removeItem("clientes-caché");
          setFiltro("");
          setPaginaActual(1);
        }}
        className="bg-gray-200 h-10 hover:bg-gray-300 cursor-pointer text-sm px-3 py-1 rounded-md"
      >
        🔄 Actualizar listado
      </button>
    </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientes.map((cliente) => (
          <Link
            key={cliente.id}
            href={`/cliente/${cliente.id}`}
            className="flex items-center gap-4 p-4 border rounded hover:shadow cursor-pointer"
          >
            {cliente.avatarUrl ? (
              <Image
                src={cliente.avatarUrl}
                alt={cliente.nombre}
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
              <p className="font-semibold">{cliente.nombre}</p>
              <p className="text-sm text-gray-500">{cliente.profesion}</p>
            </div>
          </Link>
        ))}
      </div>
      

      <div className="flex justify-center gap-2 pt-4">
        {Array.from({ length: totalPaginas }, (_, i) => (
          <button
            key={i}
            className={`px-3 py-1 border rounded ${
              paginaActual === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700"
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
