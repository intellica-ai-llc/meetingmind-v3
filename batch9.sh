#!/bin/bash
set -euo pipefail

# BATCH 9: ROOT FILES & PAGES
# Creates: App.tsx, main.tsx, Landing.tsx, Pricing.tsx, .env.example, .gitignore, README.md

mkdir -p frontend/src/pages

cat > frontend/src/App.tsx << 'EOF'
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
EOF

cat > frontend/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
EOF

cat > frontend/src/pages/Landing.tsx << 'EOF'
import Hero from '@/components/Hero'
import SampleReportPreview from '@/components/SampleReportPreview'
import WorkshopCards from '@/components/WorkshopCards'

export function Landing() {
  return (
    <div className="min-h-screen bg-meetingmind-bg">
      <Hero />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">AI Agents MeetingMind Bootcamp</h2>
          <p className="text-gray-400">Build a three-agent AI that turns meetings into intelligence</p>
        </div>
        <SampleReportPreview />
        <WorkshopCards />
        <div className="text-center py-12">
          <a href="/app" className="inline-block px-8 py-3 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Try MeetingMind →</a>
        </div>
      </div>
    </div>
  )
}
EOF

cat > frontend/src/pages/Pricing.tsx << 'EOF'
export function Pricing() {
  return (
    <div className="min-h-screen bg-meetingmind-bg flex items-center justify-center p-4">
      <div className="bg-meetingmind-card rounded-xl p-8 w-full max-w-4xl border border-meetingmind-gold/30">
        <h1 className="text-3xl font-bold text-white text-center mb-8">Simple, Transparent Pricing</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-meetingmind-bg rounded-lg p-6 text-center border border-gray-700"><h2 className="text-xl font-bold text-white mb-2">Free</h2><p className="text-3xl font-bold text-meetingmind-gold mb-4">$0</p><ul className="text-gray-400 text-sm space-y-2 mb-6"><li>✓ 10 meetings/month</li><li>✓ 60 min per meeting</li><li>✓ 30-day history</li><li>✓ Basic AI analysis</li></ul><button className="w-full py-2 bg-gray-700 text-white rounded-lg cursor-default">Current Plan</button></div>
          <div className="bg-meetingmind-bg rounded-lg p-6 text-center border-2 border-meetingmind-gold relative"><div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-meetingmind-gold text-black text-xs font-bold px-3 py-1 rounded-full">Most Popular</div><h2 className="text-xl font-bold text-white mb-2">Pro</h2><p className="text-3xl font-bold text-meetingmind-gold mb-4">$9<span className="text-sm text-gray-400">/month</span></p><ul className="text-gray-400 text-sm space-y-2 mb-6"><li>✓ 100 meetings/month</li><li>✓ 240 min per meeting</li><li>✓ 1-year history</li><li>✓ Meeting Coach</li><li>✓ Slack + Calendar</li><li>✓ Export to Notion/Asana</li></ul><button className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Upgrade to Pro</button></div>
          <div className="bg-meetingmind-bg rounded-lg p-6 text-center border border-gray-700"><h2 className="text-xl font-bold text-white mb-2">Business</h2><p className="text-3xl font-bold text-meetingmind-gold mb-4">$29<span className="text-sm text-gray-400">/month</span></p><ul className="text-gray-400 text-sm space-y-2 mb-6"><li>✓ Unlimited meetings</li><li>✓ Unlimited history</li><li>✓ Team members</li><li>✓ Priority support</li><li>✓ API access</li><li>✓ SOC2 compliance</li></ul><button className="w-full py-2 bg-meetingmind-gold text-black font-semibold rounded-lg hover:bg-yellow-600 transition">Upgrade to Business</button></div>
        </div>
      </div>
    </div>
  )
}
EOF

cat > .env.example << 'EOF'
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AssemblyAI
ASSEMBLYAI_API_KEY=your_assemblyai_key

# Groq
GROQ_API_KEY_1=your_groq_key_1
GROQ_API_KEY_2=your_groq_key_2
GROQ_API_KEY_3=your_groq_key_3

# Frontend API URL
VITE_API_URL=http://localhost:8787

# Environment
ENVIRONMENT=development
EOF

cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment files
.env
.env.local
.env.*.local

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Backend
backend/dist/
backend/.wrangler/

# Frontend
frontend/dist/
frontend/.vite/

# Coverage
coverage/
.nyc_output/

# Misc
*.tmp
.cache/
EOF

cat > README.md << 'EOF'
# MeetingMind v3.0

AI-powered meeting analysis that turns conversations into action items, decisions, and follow-up emails.

## Features

- 🎙️ Browser-based recording (no bot required)
- 📁 MP3/M4A file upload
- 🧠 13-field AI extraction
- 📧 Email tone selector (CEO/Client/Team)
- 🏆 Meeting Coach
- 📊 Task dashboard with overdue tracking
- 🔄 Unresolved thread detection
- 📈 Longitudinal pattern tracking
- 🔌 Slack & Calendar integrations
- 💯 Free tier: 10 meetings/month, 60 min/meeting

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite + Tailwind
- **Backend:** Cloudflare Workers + Hono
- **Database:** Supabase (PostgreSQL)
- **AI:** AssemblyAI + Groq

## Quick Start

```bash
# Clone
git clone https://github.com/intellica-ai-llc/meetingmind.git
cd meetingmind

# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev