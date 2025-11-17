import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  console.log("[Middleware] Verificando usuário:", user?.email || "Nenhum usuário logado")

  // Rotas de autenticação
  const authRoutes = ["/auth/login", "/auth/setup"]
  const pathname = request.nextUrl.pathname

  // Se o usuário não estiver logado e tentar acessar uma rota protegida
  if (!user && !authRoutes.includes(pathname)) {
    console.log("[Middleware] DECISÃO: Redirecionando para /auth/login")
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Se o usuário estiver logado e tentar acessar uma rota de autenticação
  if (user && authRoutes.includes(pathname)) {
    console.log("[Middleware] DECISÃO: Usuário já logado, redirecionando para /")
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  console.log("[Middleware] DECISÃO: Acesso permitido.")
  return response
}
