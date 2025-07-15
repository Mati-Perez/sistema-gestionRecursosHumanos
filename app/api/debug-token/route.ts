import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function GET() {
  const token = cookies().get('token')?.value
  if (!token) return NextResponse.json({ ok: false, mensaje: 'Sin token' })

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.json({ ok: true, payload })
  } catch {
    return NextResponse.json({ ok: false, mensaje: 'Token inválido' })
  }
}

