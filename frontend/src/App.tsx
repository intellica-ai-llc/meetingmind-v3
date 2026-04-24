import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
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
import './styles/globals.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/app" element={<ProtectedRoute><div className="min-h-screen bg-meetingmind-bg p-4"><AppPanel /></div></ProtectedRoute>} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App