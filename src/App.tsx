import { Routes, Route, Navigate } from "react-router-dom"
import { Dashboard } from "@/features/dashboard/Dashboard"
import { AuthPage } from "@/features/auth/AuthPage"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { AppLayout } from "@/components/AppLayout"
import { ProfilePage } from "@/features/profile/ProfilePage"
import { AnalysisFlow } from "@/features/analysis/AnalysisFlow"
import { HistoryPage } from "@/features/history/HistoryPage"
import { DrillsPage } from "@/features/drills/DrillsPage"
import { ArsenalPage } from "@/features/arsenal/ArsenalPage"
import { AdminLayout } from "@/features/admin/AdminLayout"
import { AdminDashboard } from "@/features/admin/AdminDashboard"
import { AdminUsersPage } from "@/features/admin/AdminUsersPage"
import { AdminDrillsPage } from "@/features/admin/AdminDrillsPage"
import { AdminSettingsPage } from "@/features/admin/AdminSettingsPage"
import { AdminFinancialPage } from "@/features/admin/AdminFinancialPage"
import { DebugPublic } from "@/features/debug/DebugPublic"


import { useEffect } from "react"
import { useAuthStore } from "@/store/useAuthStore"

export default function App() {
  const { initialize } = useAuthStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <Routes>
      <Route path="/debug" element={<DebugPublic />} />
      <Route path="/auth" element={<AuthPage />} />


      {/* Protected Routes wrapped in AppLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/analysis/new"
        element={
          <ProtectedRoute>
            <AppLayout>
              <AnalysisFlow />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ProfilePage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <AppLayout>
              <HistoryPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/drills"
        element={
          <ProtectedRoute>
            <AppLayout>
              <DrillsPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/arsenal"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ArsenalPage />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="drills" element={<AdminDrillsPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
        <Route path="financial" element={<AdminFinancialPage />} />
      </Route>

      {/* Redirect legacy routes or 404s */}
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

