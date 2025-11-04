import { NextRequest, NextResponse } from 'next/server'
import { auth } from './auth'
import {
  DEFAULT_LOGIN_REDIRECT,
  apiAuthPrefix,
  authRoutes,
  publicApiRoutes,
  publicRoutes,
} from './routes'

export default async function middleware(req: NextRequest) {
  const session = await auth()
  const { nextUrl } = req

  const isLoggedIn = !!session
  const role = session?.user?.role?.toUpperCase() ?? 'USER'

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix)
  const isPublicApiRoute = publicApiRoutes.includes(nextUrl.pathname as never)
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname as never)
  const isAuthRoute = authRoutes.includes(nextUrl.pathname as never)

  // 🔓 Permitir rutas públicas o de autenticación
  if (isApiAuthRoute || isPublicApiRoute) return NextResponse.next()

  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return NextResponse.next()
  }

  // 🚪 Si no está logueado y la ruta no es pública → login
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl))
  }

  // 🚨 Protección por rol para /admin/*
  if (nextUrl.pathname.startsWith('/admin')) {
    // ✅ Rutas permitidas para todos los roles
    const allowedForUsers = ['/admin/other-payments']

    const isAllowedUserRoute = allowedForUsers.some((path) =>
      nextUrl.pathname.startsWith(path)
    )

    // 🔒 Si no es ADMIN y la ruta no está en la lista, bloquear acceso
    if (role !== 'ADMIN' && role !== 'SUPERADMIN' && !isAllowedUserRoute) {
      return NextResponse.redirect(new URL('/403', nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
}
