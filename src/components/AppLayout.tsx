
import { Link, useLocation } from "react-router-dom"
import { LayoutDashboard, Target, Clock, User, LogOut, Menu, Box, X, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { SettingsDialog } from "@/features/settings/SettingsDialog"
import { useLanguageStore } from "@/store/useLanguageStore"
import { translations } from "@/lib/translations"

interface AppLayoutProps {
    children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation()
    const { signOut, isAdmin } = useAuthStore()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)


    const { language } = useLanguageStore()
    const t = translations[language].menu

    const navItems = [
        { href: "/", label: t.dashboard, icon: LayoutDashboard },
        { href: "/analysis/new", label: t.newAnalysis, icon: Target },
        { href: '/history', label: t.history, icon: Clock },
        { href: '/drills', label: t.drills, icon: Target },
        { href: '/arsenal', label: t.arsenal, icon: Box },
        { href: "/profile", label: t.profile, icon: User },
        ...(isAdmin ? [{ href: "/admin", label: "Admin Panel", icon: ShieldCheck }] : []),
    ]

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-col border-r bg-card">
                <div className="p-6 border-b flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg">
                        <Target className="h-6 w-6 text-primary" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">TargetMaster <span className="text-primary">Pro</span></span>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isActive = location.pathname === item.href
                        return (
                            <Link key={item.href} to={item.href}>
                                <Button
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn("w-full justify-start gap-3", isActive && "bg-secondary")}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t space-y-2">
                    <div className="px-2">
                        <SettingsDialog />
                    </div>
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => signOut()}
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden border-b bg-background p-4 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary/10 p-2 rounded-lg">
                            <Target className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-bold text-lg">TargetMaster</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>
                </header>

                {/* Mobile Menu Overlay */}
                {isMobileMenuOpen && (
                    <div className="md:hidden fixed inset-0 top-16 z-40 bg-background border-t p-4 flex flex-col gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = location.pathname === item.href
                            return (
                                <Link key={item.href} to={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className={cn("w-full justify-start gap-3", isActive && "bg-secondary")}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.label}
                                    </Button>
                                </Link>
                            )
                        })}
                        <div className="border-t my-2 pt-2 space-y-2">
                            <div className="px-2">
                                <SettingsDialog />
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-3 text-destructive"
                                onClick={() => signOut()}
                            >
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </Button>
                        </div>
                    </div>
                )}

                <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                    <div className="max-w-5xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
