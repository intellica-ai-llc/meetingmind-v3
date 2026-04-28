import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { UserPlanProvider } from '@/contexts/UserPlanProvider'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { Login } from '@/features/auth/Login'
import { Register } from '@/features/auth/Register'
import { Dashboard } from '@/features/dashboard/Dashboard'
import { Landing } from '@/pages/Landing'
import { AppPanel } from '@/components/app/AppPanel'
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
import './styles/globals.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <UserPlanProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/app" element={<ProtectedRoute><div className="min-h-screen bg-meetingmind-bg p-4"><AppPanel /></div></ProtectedRoute>} />
              <Route path="/refund-policy" element={<RefundPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/post-checkout" element={<ProtectedRoute><PostCheckoutPage /></ProtectedRoute>} />

              {/* Authenticated pages with Shell */}
              <Route path="/dashboard" element={<ProtectedRoute><Shell><Dashboard /></Shell></ProtectedRoute>} />
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
          </UserPlanProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App