import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AppProvider } from '@/contexts/AppContext'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { Login } from '@/features/auth/Login'
import { Register } from '@/features/auth/Register'
import { Dashboard } from '@/features/dashboard/Dashboard'
import { Landing } from '@/pages/Landing'
import { AppPanel } from '@/components/app/AppPanel'
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
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
