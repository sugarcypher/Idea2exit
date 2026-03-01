# IdeaForge - Innovation Launch Platform

## Original Problem Statement
Build an app for entrepreneurs/inventors/innovators/creatives with AI agent swarm that goes from idea/vision to protecting IP, auto-generating documents, market research, business plans, pitch decks, marketing strategy, landing pages, comparative analysis, timeline estimates, financial projections, and business prognosis.

## User Choices
- AI Model: OpenAI GPT-5.2 with Emergent LLM Key
- Documents: Both PDF download and inline markdown rendering
- Landing Pages: Exportable HTML with live preview
- Authentication: JWT-based enterprise auth

## Architecture
### Backend (FastAPI + MongoDB)
- JWT authentication with bcrypt password hashing
- Project CRUD with embedded AI agent swarm
- Document generation (6 types) via GPT-5.2
- Landing page generator with AI + template fallback
- Business analysis & projections with mock fallback

### Frontend (React + Tailwind + Shadcn)
- Dark theme "Deep Obsidian" design
- Multi-step project wizard (4 steps)
- AI agent visualization by role (manager/specialist/worker)
- Document hub with markdown preview + download
- Landing page builder with responsive preview + export
- Comprehensive analytics dashboard

## What's Been Implemented (March 2026)

### Phase 1 (Initial Build)
- Full authentication flow (register/login)
- 4-step project creation wizard
- Dashboard with project stats
- AI Agent swarm visualization (9 agents)
- Document Hub (6 document types)
- Basic landing page builder
- Basic analysis page

### Phase 2 (Enhancements)
- ✅ **Workflow Progress Indicator** - 5-step visual journey at top of project page
- ✅ **Landing Page Template Fallback** - Works even when AI times out
- ✅ **Comprehensive Analytics** with 6 tabs:
  - Overview (Market Size, Growth Rate, Break Even, ROI)
  - Marketing (CAC, LTV, Conversion Rate, Channel Performance)
  - Sales (Deal Size, Sales Cycle, Win Rate, Pipeline)
  - Industry (TAM, Competitors, Market Share, Trends)
  - Financial (A/B/C Scenarios with different projections)
  - Prognosis (Success Factors, Risks, Recommendations)
- ✅ **A/B/C Financial Scenarios** - Conservative, Moderate, Aggressive
- ✅ **Global/Regional Toggle** for market analysis
- ✅ **Business Services Tab**:
  - Domain & Hosting (placeholder)
  - Business Formation (placeholder)
  - Trademark Filing (placeholder)
  - Business Banking (coming soon)

## Prioritized Backlog

### P0 (Completed)
- All core features implemented

### P1 (High Priority - Next)
- Integrate domain purchasing API (GoDaddy/Namecheap)
- Integrate business formation service (Stripe Atlas / Firstbase)
- Real-time agent status via WebSocket
- PDF export for documents

### P2 (Medium Priority)
- Trademark filing integration
- Document version history
- Custom landing page templates
- Project sharing/collaboration

## Tech Stack
- Frontend: React 18, Tailwind CSS, Shadcn/UI, Lucide Icons
- Backend: FastAPI, MongoDB, JWT Auth
- AI: OpenAI GPT-5.2 via Emergent LLM Key
- Deployment: Kubernetes, Supervisor

## API Endpoints
- POST /api/auth/register, /api/auth/login
- GET/POST/DELETE /api/projects
- POST /api/documents/generate
- POST /api/landing-page/generate
- POST /api/analysis/generate
