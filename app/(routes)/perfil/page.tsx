'use client'

import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Image from 'next/image'
import { Pencil } from 'lucide-react'
import { useRouter } from 'next/navigation'


interface TokenPayload {
  sub: number
  rol: 'ADMIN' | 'CLIENTE'
  nombre: string
  email: string
  fotoUrl?: string
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState<TokenPayload | null>(null)

  const router = useRouter()


  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1]

    if (token) {
      try {
        const decoded: TokenPayload = jwtDecode(token)
        setUsuario(decoded)
      } catch (err) {
        console.error('Error al decodificar token', err)
      }
    }
  }, [])

  if (!usuario) {
    return <p className="text-center mt-10">Cargando perfil...</p>
  }

  return (
    <div className="flex items-center gap-6">
      {usuario.fotoUrl ? (
        <Image
          src={usuario.fotoUrl}
          alt="Avatar"
          width={64}
          height={64}
          className="rounded-full object-cover border border-gray-300"
        />
      ) : (
        <div className="w-16 h-16 bg-violet-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
          {usuario.nombre.charAt(0).toUpperCase()}
        </div>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">{usuario.nombre}</h2>
        <p className="text-gray-600">{usuario.email}</p>
        <span className="inline-block mt-1 text-sm px-2 py-1 bg-violet-100 text-violet-700 rounded">
          Rol: {usuario.rol}
        </span>
  
        <button
          onClick={() => router.push('/perfil/editar')}
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm rounded-md hover:bg-violet-700 transition-all duration-200 shadow-sm hover:shadow-md"
        >
          <Pencil className="w-4 h-4" />
          Editar perfil
        </button>
      </div>
    </div>
  )
}
