'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { User2Icon, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.mensaje || 'Error al iniciar sesión')
      return
    }
    
    setSuccess('¡Bienvenido! Redirigiendo...')
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuario', JSON.stringify(data.usuario))

    if (data.usuario.rol === 'ADMIN' || data.usuario.rol === 'USUARIO') {
      router.push('/')
    } else {
      router.push('/nomina')
    }
   
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl border border-gray-200">
        <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-12 mx-auto mb-4" />
        <h2 className="text-3xl font-semibold mb-2 text-center text-blue-800">Acceso al sistema</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">Ingresá tus credenciales para continuar</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <User2Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
          </div>

          {error && (
            <div className="text-red-600 text-sm font-medium bg-red-100 p-2 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="text-green-700 text-sm font-medium bg-green-100 p-2 rounded-md">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
        