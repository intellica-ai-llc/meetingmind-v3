import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { UserPlanProvider } from '@/contexts/UserPlanProvider'
import { useAuth } from '@/contexts/AuthContext'
import { usePlan } from '@/contexts/UserPlanProvider'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { Login } from '@/features/auth/Login'
import { Register } from '@/features/auth/Register'
import { Landing } from '@/pages/Landing'
import { AppShell } from '@/components/layout/AppShell'
import { RefundPolicy } from '@/pages/RefundPolicy'
import { TermsOfService } from '@/pages/TermsOfService'
import { PrivacyPolicy } from '@/pages/PrivacyPolicy'
import { Contact } from '@/pages/Contact'
import { Shell } from '@/components/layout/Shell'
import { Settings } from '@/pages/Settings'
import { MeetingsPage } from '@/pages/MeetingsPage'
import { MeetingDetailPage } from '@/pages/MeetingDetailPage'
import { TasksPage } from '@/pages/TasksPage'
import { CoachingPage } from '@/pages/CoachingPage'
import { AlertSettingsPage } from '@/pages/AlertSettingsPage'
import { SpeakerProfileManager } from '@/pages/SpeakerProfileManager'
import { InitiativeDetailPage } from '@/pages/InitiativeDetailPage'
import { InitiativesPage } from '@/pages/InitiativesPage'
import { Pricing } from '@/pages/Pricing'
import { PostCheckoutPage } from '@/pages/PostCheckoutPage'
import { DashboardShell } from '@/components/layout/DashboardShell'
import { DashboardV5 } from '@/features/dashboard/DashboardV5'
import './styles/globals.css'

/**
 * Single gate that blocks rendering of any routed content
 * until both authentication and plan checks have completed.
 * This prevents layout flicker / flash of wrong UI.
 */
function AppGate({ children }: { children: React.ReactNode }) {
  const { loading: authLoading } = useAuth()
  const { loading: planLoading } = usePlan()

  if (authLoading || planLoading) {
    // Render nothing visible – the background colour matches the dashboard
    // so there's no white flash, and the app feels instant once ready.
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'var(--mm-bg-primary)',
          zIndex: 9999,
        }}
      />
    )
  }

  return <>{children}</>
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <UserPlanProvider>
            <AppGate>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
                <Route path="/refund-policy" element={<RefundPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/post-checkout" element={<ProtectedRoute><PostCheckoutPage /></ProtectedRoute>} />

                {/* Dashboard */}
                <Route path="/dashboard" element={<ProtectedRoute><DashboardShell><DashboardV5 /></DashboardShell></ProtectedRoute>} />

                {/* Authenticated pages with original Shell */}
                <Route path="/meetings" element={<ProtectedRoute><Shell><MeetingsPage /></Shell></ProtectedRoute>} />
                <Route path="/meetings/:id" element={<ProtectedRoute><Shell><MeetingDetailPage /></Shell></ProtectedRoute>} />
                <Route path="/tasks" element={<ProtectedRoute><Shell><TasksPage /></Shell></ProtectedRoute>} />
                <Route path="/initiatives" element={<ProtectedRoute><Shell><InitiativesPage /></Shell></ProtectedRoute>} />
                <Route path="/initiatives/:id" element={<ProtectedRoute><Shell><InitiativeDetailPage /></Shell></ProtectedRoute>} />
                <Route path="/patterns" element={<ProtectedRoute><Shell><div>Patterns (coming soon)</div></Shell></ProtectedRoute>} />
                <Route path="/coaching" element={<ProtectedRoute><Shell><CoachingPage /></Shell></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Shell><Settings /></Shell></ProtectedRoute>} />
                <Route path="/settings/alerts" element={<ProtectedRoute><Shell><AlertSettingsPage /></Shell></ProtectedRoute>} />
                <Route path="/settings/speakers" element={<ProtectedRoute><Shell><SpeakerProfileManager /></Shell></ProtectedRoute>} />
              </Routes>
            </AppGate>
          </UserPlanProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App