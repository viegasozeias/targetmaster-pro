import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import type { Profile } from "@/store/useAuthStore"
import { useAuthStore } from "@/store/useAuthStore"

export function AdminUsersPage() {
    const { user: currentUser } = useAuthStore()
    const [users, setUsers] = useState<Profile[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchUsers()
    }, [])

    async function fetchUsers() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) throw error
            setUsers(data as Profile[])
        } catch (error) {
            console.error('Error fetching users:', error)
        } finally {
            setIsLoading(false)
        }
    }

    async function toggleRole(userId: string, currentRole: string) {
        if (userId === currentUser?.id) {
            alert("You cannot change your own role.")
            return
        }

        const newRole = currentRole === 'admin' ? 'user' : 'admin'
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)

            if (error) throw error

            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
        } catch (error) {
            console.error('Error updating role:', error)
            alert("Failed to update role")
        }
    }

    async function togglePro(userId: string, currentTier: string) {
        const newTier = currentTier === 'pro' ? 'free' : 'pro'
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ subscription_tier: newTier })
                .eq('id', userId)

            if (error) throw error

            setUsers(users.map(u => u.id === userId ? { ...u, subscription_tier: newTier } : u))
        } catch (error) {
            console.error('Error updating subscription:', error)
            alert("Failed to update subscription")
        }
    }

    if (isLoading) return <div>Loading users...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">User Management</h1>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Subscription</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.subscription_tier === 'pro' ? 'default' : 'outline'}>
                                        {user.subscription_tier}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Admin</span>
                                            <Switch
                                                checked={user.role === 'admin'}
                                                onCheckedChange={() => toggleRole(user.id, user.role)}
                                                disabled={user.id === currentUser?.id}
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-muted-foreground">Pro</span>
                                            <Switch
                                                checked={user.subscription_tier === 'pro'}
                                                onCheckedChange={() => togglePro(user.id, user.subscription_tier)}
                                            />
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
