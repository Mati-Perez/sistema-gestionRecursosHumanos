import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full w-full">
      <body className="bg-stone-100 antialiased h-full w-full">
        {children}
      </body>
    </html>
  )
}
