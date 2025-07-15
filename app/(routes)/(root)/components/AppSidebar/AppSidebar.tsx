"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { routes } from "./AppSidebar.data";
import Image from "next/image";
import { useEffect, useState } from "react";

export function AppSidebar({ rol }: { rol: 'ADMIN' | 'CLIENTE' | 'USUARIO' }) {
  const { state } = useSidebar();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);


  const filteredRoutes = routes.filter((item) => {
  if (item.action) return true;

  const isAdmin = rol === "ADMIN";
  const isCliente = rol === "CLIENTE";

  // Usuarios solo visibles para ADMIN
  if (!isAdmin && item.title === "Usuarios") return false;

  // Clientes ocultos para CLIENTE
  if (isCliente && item.title === "Clientes") return false;

  return true;
});

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="bg-zinc-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100">
        <SidebarHeader>
          <Link href="/" className="flex flex-row items-center">
            <Image src="/logo.png" alt="Logo Sistema de gestion" width={35} height={35} />
            {mounted && state === "expanded" && (
              <span className="text-sm font-semibold text-gray-800 tracking-wide">
                Gestion de recursos humanos
              </span>
            )}
          </Link>
        </SidebarHeader>


        <SidebarGroup>
          <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
          <SidebarMenu className="space-y-2">
          {filteredRoutes.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                {item.action ? (
                  <button
                    onClick={() => {
                      // Aquí hacés logout: podés borrar cookies, token, redirigir, etc.
                      document.cookie = "token=; max-age=0"; // ejemplo simple
                      localStorage.clear();  
                      window.location.href = "/login"; // o la ruta deseada
                    }}
                    className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-violet-100 cursor-pointer transition-colors"
                  >
                    <div className="p-1 rounded-lg text-white bg-violet-400">
                      <item.icon className="w-4 h-4" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </button>
                ) : (
                  <a
                    href={item.url}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-violet-100 transition-colors"
                  >
                    <div className="p-1 rounded-lg text-white bg-violet-400">
                      <item.icon className="w-4 h-4" />
                    </div>
                    {state === "expanded" && <span>{item.title}</span>}
                  </a>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

