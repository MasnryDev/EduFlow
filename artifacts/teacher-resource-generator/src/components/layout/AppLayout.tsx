import * as React from "react"
import { useAuth } from "@workspace/replit-auth-web"
import { Link, useLocation } from "wouter"
import { LayoutDashboard, FilePlus2, History, UserCircle, LogOut, Menu, X, BookOpenCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { cn } from "@/lib/utils"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, login, logout } = useAuth()
  const [location] = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      login()
    }
  }, [isLoading, isAuthenticated, login])

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/create", label: "Create Resource", icon: FilePlus2 },
    { href: "/history", label: "History", icon: History },
    { href: "/account", label: "Account", icon: UserCircle },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-xl tracking-tight">
          <BookOpenCheck className="w-6 h-6" />
          <span>AITeacher</span>
        </Link>
      </div>
      <div className="px-4 py-2 flex-1 flex flex-col gap-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location === item.href
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
              <div className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}>
                <Icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          )
        })}
      </div>
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <div className="px-2 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">Theme</span>
          <ModeToggle />
        </div>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground" onClick={() => logout()}>
          <LogOut className="w-4 h-4" />
          Log out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-[100dvh] flex bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 z-20">
        <SidebarContent />
      </aside>

      {/* Mobile Nav */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-border bg-background z-30 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-lg">
          <BookOpenCheck className="w-5 h-5" />
          <span>AITeacher</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-20 bg-background">
          <SidebarContent />
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
