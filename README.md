# MeetingMind v3.0

multi Agent powered meeting analysis that turns conversations into action items, decisions, and follow-up emails and detailed reports.

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
