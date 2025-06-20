"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import { Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Image from "next/image";

type Cliente = {
  id: string;
  nombre: string;
  profesion: string;
  avatarUrl?: string;
  telefono?: string;
  email?: string;
  compania?: string;
};

const CLIENTES_POR_PAGINA = 15;

export default function Directorio() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [filtro, setFiltro] = useState("");
  const [paginaActual, setPaginaActual] = useState(1);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState<Omit<Cliente, "id">>({
    nombre: "",
    profesion: "",
    avatarUrl: "",
    telefono: "",
    email: "",
    compania: "",
  });

  useEffect(() => {
    const guardados = localStorage.getItem("clientes");
    if (guardados) {
      setClientes(JSON.parse(guardados));
    } else {
      const iniciales: Cliente[] = [
        {
          id: crypto.randomUUID(),
          nombre: "Sofía Martínez",
          profesion: "Diseñadora UX/UI",
          avatarUrl: "https://i.pravatar.cc/150?img=47",
          telefono: "11 2345 6789",
          email: "sofia@example.com",
          compania: "Diseño Creativo SRL",
        },
        {
          id: crypto.randomUUID(),
          nombre: "Juan Pérez",
          profesion: "Contador Público",
          avatarUrl: "https://i.pravatar.cc/150?img=5",
          telefono: "11 8888 1234",
          email: "juanperez@contadores.com",
          compania: "Estudio Pérez & Asociados",
        },
        {
          id: crypto.randomUUID(),
          nombre: "Camila Torres",
          profesion: "Abogada Laboral",
          avatarUrl: "https://i.pravatar.cc/150?img=15",
          telefono: "11 4567 8910",
          email: "camila.torres@estudiotorres.com",
          compania: "Estudio Jurídico Torres"
        },
        {
          id: crypto.randomUUID(),
          nombre: "Lucas Fernández",
          profesion: "Desarrollador Full Stack",
          avatarUrl: "https://i.pravatar.cc/150?img=26",
          telefono: "11 9999 1122",
          email: "lucas.fernandez@techloop.io",
          compania: "TechLoop"
        },
        {
          id: crypto.randomUUID(),
          nombre: "Valentina Rojas",
          profesion: "Arquitecta",
          avatarUrl: "https://i.pravatar.cc/150?img=33",
          telefono: "11 7812 3344",
          email: "vrojas@arquiestudio.com",
          compania: "ArquiEstudio"
        }
      ];
      localStorage.setItem("clientes", JSON.stringify(iniciales));
      setClientes(iniciales);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("clientes", JSON.stringify(clientes));
  }, [clientes]);

  const clientesFiltrados = clientes.filter((c) =>
    [c.nombre, c.profesion].some((campo) =>
      campo.toLowerCase().includes(filtro.toLowerCase())
    )
  );

  const totalPaginas = Math.ceil(clientesFiltrados.length / CLIENTES_POR_PAGINA);
  const clientesPagina = clientesFiltrados.slice(
    (paginaActual - 1) * CLIENTES_POR_PAGINA,
    paginaActual * CLIENTES_POR_PAGINA
  );

  const manejarCambio = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const manejarSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim() || !formData.profesion.trim()) return;

    const nuevoCliente: Cliente = {
      id: crypto.randomUUID(),
      ...formData,
    };

    setClientes((prev) => [nuevoCliente, ...prev]);
    setFormData({
      nombre: "",
      profesion: "",
      avatarUrl: "",
      telefono: "",
      email: "",
      compania: "",
    });
    setMostrarFormulario(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">Directorio</h1>
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
              setFiltro(e.target.value);
              setPaginaActual(1);
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
            <Input name="nombre" placeholder="Nombre" value={formData.nombre} onChange={manejarCambio} required />
            <Input name="profesion" placeholder="Profesión" value={formData.profesion} onChange={manejarCambio} required />
            <Input name="telefono" placeholder="Teléfono" value={formData.telefono} onChange={manejarCambio} />
            <Input name="email" placeholder="Correo electrónico" value={formData.email} onChange={manejarCambio} />
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

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {clientesPagina.map((cliente) => (
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
  );
}
