'use client'

import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import { useRouter } from 'next/navigation'

interface TokenPayload {
  sub: number
  rol: 'ADMIN' | 'CLIENTE'
  nombre: string
  email: string
}

export default function EditarPerfilPage() {
  const [usuario, setUsuario] = useState<TokenPayload | null>(null)
  const [nombre, setNombre] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
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
        setNombre(decoded.nombre)
      } catch (err) {
        console.error('Error al decodificar token', err)
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
  
    let imagenUrl = ''
  
    if (foto) {
      const form = new FormData()
      form.append('foto', foto)
  
      const res = await fetch('/api/perfil/upload', {
        method: 'POST',
        body: form,
      })
  
      const data = await res.json()
      if (!res.ok) {
        alert('Error al subir la imagen')
        return
      }
  
      imagenUrl = data.url
    }
  
    const res = await fetch('/api/perfil/actualizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, fotoUrl: imagenUrl }),
    })
  
    if (res.ok) {
      alert('Perfil actualizado')
      router.push('/perfil')
    } else {
      const data = await res.json()
      alert(data.mensaje || 'Error al actualizar perfil')
    }
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFoto(e.target.files[0])
    }
  }

  if (!usuario) return <p className="text-center mt-10">Cargando...</p>

  return (
    <div className="max-w-xl mx-auto mt-12 bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Editar perfil</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            type="text"
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-violet-500 focus:border-violet-500"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email (solo lectura)</label>
          <input
            type="email"
            className="mt-1 w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md"
            value={usuario.email}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Foto de perfil</label>
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm text-gray-500"
            onChange={handleFotoChange}
          />
          
        </div>

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={() => router.push('/perfil/cambiar-contraseña')}
            className="text-sm text-violet-600 hover:underline"
          >
            Cambiar contraseña
          </button>

          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-md"
          >
            Guardar cambios
          </button>
        </div>
      </form>
    </div>
  )
}
