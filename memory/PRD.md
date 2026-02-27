# IdeaForge - Innovation Launch Platform

## Original Problem Statement
Build an app for entrepreneurs/inventors/innovators/creatives that identifies user needs, then has an AI agent swarm (workers, managers, specialists) to go from idea/vision to:
- Protecting intellectual property
- Auto-generating: white papers, market research, business plans, pitch decks, marketing strategy
- Building landing pages
- Comparative analysis (world with/without the idea)
- Estimating time to actualization, financial cost, and business prognosis

## User Choices
- AI Model: OpenAI GPT-5.2 with Emergent LLM Key
- Documents: Both PDF download and inline markdown rendering
- Landing Pages: Exportable HTML with live preview
- Authentication: JWT-based enterprise auth

## Architecture
### Backend (FastAPI + MongoDB)
- JWT authentication with bcrypt password hashing
- Project CRUD with embedded AI agent swarm
- Document generation via GPT-5.2 (6 types)
- Landing page generator
- Business analysis & projections

### Frontend (React + Tailwind + Shadcn)
- Dark theme "Deep Obsidian" design
- Multi-step project wizard
- AI agent visualization by role (manager/specialist/worker)
- Document hub with markdown preview
- Landing page builder with responsive preview
- Analysis dashboard with comparative/timeline/financial/prognosis views

## User Personas
1. **Startup Founder** - Needs full business planning suite
2. **Inventor** - Focuses on IP protection and technical docs
3. **Creative** - Uses landing page builder and pitch decks

## Core Requirements (Static)
- [x] User authentication (register/login)
- [x] Project creation wizard
- [x] AI agent swarm display
- [x] Document generation (6 types)
- [x] Landing page builder
- [x] Business analysis & projections

## What's Been Implemented (Jan 2026)
- Full authentication flow with JWT tokens
- 4-step project creation wizard
- Dashboard with project stats
- AI Agent swarm visualization (manager, specialist, worker roles)
- Document Hub with 6 document types (white paper, business plan, pitch deck, market research, marketing strategy, IP protection)
- Landing page builder with HTML/CSS export
- Analysis page with comparative, timeline, financial, and prognosis views
- Beautiful dark theme UI following design guidelines

## Prioritized Backlog

### P0 (Critical)
- All P0 items completed

### P1 (High Priority)
- PDF export for documents
- Real-time agent status updates via WebSocket
- Project sharing/collaboration

### P2 (Medium Priority)
- Document version history
- Custom landing page templates
- Export analysis to PDF report
- Integration with external tools (Notion, Slack)

## Next Tasks
1. Add PDF export functionality using html2pdf.js
2. Implement WebSocket for real-time agent updates
3. Add project templates for quick start
4. Create onboarding tutorial
