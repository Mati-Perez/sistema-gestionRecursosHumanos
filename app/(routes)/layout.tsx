// app/(routes)/layout.tsx
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./(root)/components"
import { Footer, Navbar } from "@/components/Shared"
import { ThemeInit } from "@/components/ThemeInit"
import { Toaster } from 'sonner'
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"

interface TokenPayload {
  sub: number
  rol: "ADMIN" | "CLIENTE"
  nombre: string
  email: string
}

export default async function RoutesLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get("token")?.value

  let rol: TokenPayload["rol"] = "CLIENTE"
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as unknown as TokenPayload
      rol = decoded.rol
    } catch {}
  }

  return (
    <>
      <ThemeInit />
      <SidebarProvider>
        <AppSidebar rol={rol} />
        <div className="w-full flex flex-col min-h-screen bg-stone-100">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </SidebarProvider>
      <Toaster richColors closeButton />
    </>
  )
}
