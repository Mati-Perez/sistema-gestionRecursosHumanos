import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

interface TokenPayload {
  sub: number
  rol: 'ADMIN' | 'CLIENTE' | 'USUARIO'
  nombre: string
  email: string
}

const PUBLIC_ROUTES = ['/login', '/api/login', "/logo.png", "/favicon.ico"]

// 🔐 Verificación de token compatible con Edge
async function verifyToken(token: string): Promise<TokenPayload> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const { payload } = await jwtVerify(token, secret)
  return payload as unknown as TokenPayload
}

// 🚦 Middleware principal
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('token')?.value

  // ✅ Permitir rutas públicas
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next()
  }

  // ⛔ Redirigir si no hay token
  if (!token) {
    console.log('⛔ Sin token: redirigiendo a /login')
    return NextResponse.redirect(new URL('/login', request.url))
  }

  try {
    const decoded = await verifyToken(token)
    console.log('🔓 Token decodificado:', decoded)

    // 🛡️ Redirigir CLIENTE desde raíz
    if (pathname === '/' && decoded.rol === 'CLIENTE') {
      return NextResponse.redirect(new URL('/nomina', request.url))
    }

    // 🔐 Acceso exclusivo a /admin
    if (pathname.startsWith('/usuarios') && decoded.rol !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // 🔐 Acceso a /cliente solo si sos CLIENTE o ADMIN
    if (pathname.startsWith('/cliente') && decoded.rol !== 'ADMIN' && decoded.rol !== 'USUARIO') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // ✅ Acceso permitido
    return NextResponse.next()
  } catch (error) {
    console.error('❌ Token inválido:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

// 🧭 Aplicar a rutas visibles (excluye API, assets y favicon)
export const config = {
  matcher: ['/', '/((?!api|_next|favicon.ico).*)'],
}
