import Link from "next/link";


export function Footer() {
  return (
    <footer className="py-4 px-6 border-t bg-zinc-100 w-full dark:bg-zinc-900 border-b dark:border-zinc-700">
      <div className="flex justify-between items-center text-sm text-slate-500">
        <p>2025 ©Todos los derechos reservados</p>

        <div className="flex gap-2 items-center">
          <Link href="/privacy-policy">Privacidad</Link>
          <Link href="/terms">Terminos de uso</Link>
        </div>

      </div>
    </footer>
  )
}

