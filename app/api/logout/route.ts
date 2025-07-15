// app/api/logout/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const response = NextResponse.redirect('/login')
  response.cookies.set({
    name: 'token',
    value: '',
    path: '/',
    expires: new Date(0),
    httpOnly: true,
  })
  return response
}
