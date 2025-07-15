'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CambiarContraseñaPage() {
  const [actual, setActual] = useState('')
  const [nueva, setNueva] = useState('')
  const [confirmacion, setConfirmacion] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMensaje('')

    if (nueva !== confirmacion) {
      setError('Las contraseñas nuevas no coinciden')
      return
    }

    setLoading(true)

    const res = await fetch('/api/perfil/cambiar-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual, nueva }),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.mensaje || 'Error al cambiar la contraseña')
    } else {
      setMensaje('Contraseña actualizada correctamente')
      setActual('')
      setNueva('')
      setConfirmacion('')
      setTimeout(() => router.push('/perfil'), 1500)
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Cambiar contraseña</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contraseña actual</label>
          <input
            type="password"
            value={actual}
            onChange={(e) => setActual(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
          <input
            type="password"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            required
            className="mt-1 w-full px-4 py-2 border rounded-md border-gray-300"
          />
        </div>

        {error && <p className="text-red-600 text-sm">{error}</p>}
        {mensaje && <p className="text-green-600 text-sm">{mensaje}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  )
}
