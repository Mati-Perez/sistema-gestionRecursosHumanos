

export default function AuthLayout({children} : { children: React.ReactNode; }){
  return (
  <div className="w-full h-screen">
    <div className="flex h-full w-full items-center justify-center">
      <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-teal-400 via-cyan-300 to-sky-500 z-[-1]"/>
      {children}

    </div>
    
  </div>
  )
}
