"use client";

import {
  BellRing,
  LogOut,
  Image as ImageIcon,
  KeyRound,
  UserCircle,
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";

interface TokenPayload {
  sub: number;
  rol: "ADMIN" | "CLIENTE" | "USUARIO";
  nombre: string;
  email: string;
  fotoUrl?: string;
}

export function Navbar() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [usuario, setUsuario] = useState<TokenPayload | null>(null);

  useEffect(() => {
    const local = localStorage.getItem("usuario");
    if (local) {
      setUsuario(JSON.parse(local));
    } else {
      const obtenerUsuario = async () => {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUsuario(data);
          localStorage.setItem("usuario", JSON.stringify(data)); // ✅ guardar
        }
      };
      obtenerUsuario();
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "GET" });
    localStorage.removeItem("usuario"); // ✅ limpiar
    router.push("/login");
  };

  return (
    <div className="flex justify-between p-4 border-b bg-zinc-100 h-16 dark:bg-zinc-900 border-b dark:border-zinc-700 relative">
      <SidebarTrigger className="hover:opacity-80 cursor-pointer" />

      <div className="flex gap-4 items-center">
        <Button variant="outline">
          <BellRing />
        </Button>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1 rounded-full hover:opacity-90 cursor-pointer transition"
          >
            {usuario?.fotoUrl ? (
              <Image
                src={usuario.fotoUrl}
                alt="Avatar"
                width={36}
                height={36}
                className="rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-9 h-9 bg-violet-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {usuario?.nombre?.charAt(0).toUpperCase() || (
                  <UserCircle className="w-5 h-5" />
                )}
              </div>
            )}
            <span className="text-sm font-medium hidden sm:inline text-gray-800 dark:text-white">
              {usuario?.nombre || "Usuario"}
            </span>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-800 shadow-lg rounded-md border border-zinc-200 dark:border-zinc-700 z-50">
              <button
                onClick={() => router.push("/perfil")}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 cursor-pointer dark:hover:bg-zinc-700 text-sm"
              >
                <ImageIcon className="w-4 h-4" />
                Subir foto
              </button>

              <button
                onClick={() => router.push("/perfil/cambiar-password")}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-100 cursor-pointer dark:hover:bg-zinc-700 text-sm"
              >
                <KeyRound className="w-4 h-4" />
                Cambiar contraseña
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-100 cursor-pointer dark:hover:bg-red-800 text-sm text-red-600 dark:text-red-400"
              >
                <LogOut className="w-4 h-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
