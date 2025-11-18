import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function proxy(request: NextRequest) {
  // Criar uma resposta inicial que será modificada
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // A requisição e a resposta devem ser atualizadas
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // A requisição e a resposta devem ser atualizadas
          request.cookies.set({ name, value: "", ...options })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const publicUrls = ["/auth/login", "/auth/setup"]
  const isPublicApiRoute = request.nextUrl.pathname.startsWith('/api/whatsapp/webhook');

  // Se não houver usuário e a rota não for pública, redireciona para o login
  if (!user && !publicUrls.includes(request.nextUrl.pathname) && !isPublicApiRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    return NextResponse.redirect(url)
  }

  // Se houver usuário e ele tentar acessar uma rota pública (como login), redireciona para a home
  if (user && publicUrls.includes(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // Retorna a resposta (que pode ter sido modificada com novos cookies)
  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}