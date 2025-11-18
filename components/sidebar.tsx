import { Users, MessageSquare, Briefcase, Settings, Webhook, Upload, LogOut, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useEffect, useState } from "react"
import Image from "next/image"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface SidebarProps {
  activeView: "candidates" | "conversations" | "jobs" | "system-prompt" | "webhook-setup" | "users"
  onViewChange: (view: "candidates" | "conversations" | "jobs" | "system-prompt" | "webhook-setup" | "users") => void
  userRole: "admin" | "recruiter"
  userName: string
  unreadCount?: number
}

export function Sidebar({ activeView, onViewChange, userRole, userName, unreadCount = 0 }: SidebarProps) {
  const [logo, setLogo] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedLogo = localStorage.getItem("company-logo")
    if (savedLogo) {
      setLogo(savedLogo)
    }
  }, [])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIsUploadingLogo(true)
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setLogo(result)
        localStorage.setItem("company-logo", result)
        setIsUploadingLogo(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogo(null)
    localStorage.removeItem("company-logo")
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const navItems = [
    { id: "candidates" as const, label: "Candidatos", icon: Users },
    { id: "conversations" as const, label: "Conversas", icon: MessageSquare },
    { id: "jobs" as const, label: "Vagas", icon: Briefcase },
    { id: "system-prompt" as const, label: "Configuração Bot", icon: Settings },
    { id: "webhook-setup" as const, label: "Configuração WhatsApp", icon: Webhook },
    ...(userRole === "admin" ? [{ id: "users" as const, label: "Usuários", icon: UserCog }] : []),
  ]

  return (
    <aside className="w-64 border-r border-sidebar-border bg-gradient-to-b from-sidebar via-sidebar to-sidebar/90 flex flex-col h-screen">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-2">
          {logo ? (
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image src={logo || "/placeholder.svg"} alt="Logo" fill className="object-contain" />
            </div>
          ) : null}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Tria+</h1>
            <p className="text-sm text-white/80">Recrutamento Inteligente</p>
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <label className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              disabled={isUploadingLogo}
            />
            <Button
              className="w-full bg-[#4545FF] hover:bg-[#4545FF]/90 text-white"
              size="sm"
              asChild
              disabled={isUploadingLogo}
            >
              <span className="cursor-pointer">
                <Upload className="mr-2 h-3 w-3" />
                {isUploadingLogo ? "Enviando..." : logo ? "Alterar Logo" : "Upload Logo"}
              </span>
            </Button>
          </label>
          {logo && (
            <Button
              className="px-3 bg-[#4545FF] hover:bg-[#4545FF]/90 text-white"
              size="sm"
              onClick={handleRemoveLogo}
            >
              Remover
            </Button>
          )}
        </div>
      </div>

      <nav className="px-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id

          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start text-white ${
                isActive
                  ? "bg-sidebar-primary hover:bg-sidebar-primary/90"
                  : "hover:bg-white/20 hover:text-white"
              }`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="mr-3 h-4 w-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.id === "conversations" && unreadCount > 0 && (
                <Badge className="h-5 bg-red-500 text-white">{unreadCount}</Badge>
              )}
            </Button>
          )
        })}
      </nav>

      <div className="px-3 pb-4 space-y-2">
        <Button
          className="w-full justify-start bg-[#4545FF] hover:bg-[#4545FF]/90 text-white"
          onClick={handleLogout}
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sair
        </Button>

        <div className="p-2 rounded-lg bg-white/10 border border-white/20">
          <p className="text-xs font-medium text-white">{userName}</p>
          <p className="text-xs text-white/70 capitalize">
            {userRole === "admin" ? "Administrador" : "Recrutador"}
          </p>
        </div>
      </div>
    </aside>
  )
}
