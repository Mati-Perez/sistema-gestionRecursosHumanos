"use client"

import { BellRing, LogIn } from "lucide-react";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";


export function Navbar() {
  return (
    <div className="flex justify-between p-4 border-b bg-zinc-100 h-16 dark:bg-zinc-900 border-b dark:border-zinc-700">
      <SidebarTrigger className="hover:opacity-80 cursor-pointer" />
      <div className="flex gap-4 items-center">
        

        <Button variant="outline">
          <BellRing />
        </Button>

        <SignedOut>
          <SignInButton>
            <Button>
              <LogIn />
              Iniciar sesión
            </Button>
          </SignInButton>
        </SignedOut>

        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      
    </div>
  )
}

