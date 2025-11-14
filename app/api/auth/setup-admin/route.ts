import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, senha e nome são obrigatórios" }, { status: 400 })
    }

    // Criar cliente Supabase com Service Role Key para criar usuários
    const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    const { data: existingUsers, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("role", "admin")
      .limit(1)

    if (checkError) {
      console.error("Erro ao verificar usuários existentes:", checkError)
      return NextResponse.json({ error: "Erro ao verificar usuários existentes" }, { status: 500 })
    }

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json({ error: "Já existe um usuário administrador. Use a página de login." }, { status: 400 })
    }

    const { data: existingAuthUser } = await supabase.auth.admin.listUsers()
    const emailExists = existingAuthUser?.users.some((user) => user.email === email)

    let userId: string

    if (emailExists) {
      // Email já existe no Auth, buscar o ID do usuário
      const existingUser = existingAuthUser?.users.find((user) => user.email === email)
      if (!existingUser) {
        return NextResponse.json({ error: "Erro ao buscar usuário existente" }, { status: 500 })
      }
      userId = existingUser.id

      // Verificar se já existe na tabela users
      const { data: userInTable } = await supabase.from("users").select("id").eq("id", userId).single()

      if (userInTable) {
        return NextResponse.json({ error: "Este usuário já está configurado. Use a página de login." }, { status: 400 })
      }
    } else {
      // Criar novo usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

      if (authError) {
        console.error("Erro ao criar usuário no Auth:", authError)
        return NextResponse.json({ error: `Erro ao criar usuário: ${authError.message}` }, { status: 500 })
      }

      if (!authData.user) {
        return NextResponse.json({ error: "Erro ao criar usuário" }, { status: 500 })
      }

      userId = authData.user.id
    }

    // Criar registro na tabela users
    const { error: dbError } = await supabase.from("users").insert({
      id: userId,
      email,
      name,
      role: "admin",
    })

    if (dbError) {
      console.error("Erro ao criar usuário no banco:", dbError)
      return NextResponse.json({ error: `Erro ao salvar usuário: ${dbError.message}` }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Administrador criado com sucesso! Você pode fazer login agora.",
      user: {
        id: userId,
        email,
        name,
      },
    })
  } catch (error) {
    console.error("Erro no setup do admin:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
