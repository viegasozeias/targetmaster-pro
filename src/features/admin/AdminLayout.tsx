import { useEffect } from "react"
import { Outlet, useNavigate, Link, useLocation } from "react-router-dom"
import { useAuthStore } from "@/store/useAuthStore"
import { Button } from "@/components/ui/button"
import {
    LayoutDashboard,
    Users,
    Target,
    LogOut,
    Menu,
    Settings,
    DollarSign
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function AdminLayout() {
    const { user, isAdmin, isLoading, signOut } = useAuthStore()
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        if (!isLoading && (!user || !isAdmin)) {
            navigate("/")
        }
    }, [user, isAdmin, isLoading, navigate])

    if (isLoading) {
        return (
            <div className="flex flex-col h-screen items-center justify-center gap-4">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                <p>Loading Admin Panel...</p>
                <div className="p-4 bg-muted rounded text-xs font-mono text-left">
                    <p>Debug Info:</p>
                    <p>User: {user ? user.email : 'null'}</p>
                    <p>IsAdmin: {String(isAdmin)}</p>
                    <p>IsLoading: {String(isLoading)}</p>
                </div>
            </div>
        )
    }
    if (!isAdmin) return null

    const navItems = [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
        { href: "/admin/financial", label: "Financial", icon: DollarSign },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/drills", label: "Drills", icon: Target },
        { href: "/admin/settings", label: "Settings", icon: Settings },
    ]

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            <div className="p-6 border-b">
                <h1 className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
                    Admin Panel
                </h1>
            </div>
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.href
                    return (
                        <Link key={item.href} to={item.href}>
                            <Button
                                variant={isActive ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3"
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Button>
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t space-y-2">
                <Link to="/dashboard">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Back to App
                    </Button>
                </Link>
                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => {
                        signOut()
                        navigate("/auth")
                    }}
                >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )

    return (
        <div className="flex min-h-screen bg-background">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block w-64 border-r bg-card/50 backdrop-blur-sm fixed h-full z-30">
                <SidebarContent />
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 border-b bg-background/80 backdrop-blur-md z-40 flex items-center px-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon">
                            <Menu className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
                <span className="ml-4 font-bold">Admin Panel</span>
            </div>

            {/* Main Content */}
            <main className="flex-1 md:ml-64 p-4 md:p-8 pt-20 md:pt-8 overflow-y-auto h-screen">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
