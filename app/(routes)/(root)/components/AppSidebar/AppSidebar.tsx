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

export function AppSidebar() {
  const {state} = useSidebar()

  return (
    <Sidebar collapsible="icon">
      
      <SidebarContent className="bg-zinc-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-100">
      <SidebarHeader>
        <Link href="/" className="flex flex-row items-center">
        <Image src="/logo.png" alt="Logo Sistema de gestion" width={35} height={35}/>
        {state === "expanded" && (
          <span className="text-sm font-semibold text-gray-800 tracking-wide">
            Gestion de recursos humanos
          </span>
        )}
        
        </Link>
      </SidebarHeader>
      <SidebarGroup>
        <SidebarGroupLabel>Plataforma</SidebarGroupLabel>
        <SidebarMenu className="space-y-2">
          {routes.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a
                  href={item.url}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-violet-100 transition-colors"
                >
                  <div className="p-1 rounded-lg text-white bg-violet-400">
                    <item.icon className="w-4 h-4" />
                  </div>
                  {state === "expanded" && <span>{item.title}</span>}
                </a>

              </SidebarMenuButton>
            </SidebarMenuItem>


          ))}
          

        </SidebarMenu>

      </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

