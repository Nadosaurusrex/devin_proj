# Feature Flag Removal Dashboard

> Automated feature flag analysis and safe removal powered by Devin AI

**Live Demo:** [https://devin-proj.vercel.app](https://devin-proj.vercel.app)

---

## Overview

This project demonstrates a production-ready workflow for safely removing deprecated feature flags from codebases. It combines GitHub API integration, AI-powered analysis via Devin, and automated PR generation to streamline technical debt cleanup.

**Built for:** Take-home technical assessment
**Tech Stack:** Next.js 14, TypeScript, PrimeReact, Devin AI API, GitHub API
**Deployment:** Vercel (serverless)

---

## ✨ Key Features

### 🔗 GitHub Integration
- Connect to any public GitHub repository
- Parse feature flag registries (JSON/YAML)
- View flags with metadata (state, description, last modified)

### 🔍 Smart Analysis
- Devin AI analyzes flag usage across the entire codebase
- Identifies all references with file paths and line numbers
- Provides risk assessment and confidence scoring
- Estimates effort required for removal

### ⚡ Automated Removal
- Safely removes flags and inlines target behavior
- Updates registry files automatically
- Runs tests and builds before creating PR
- Generates pull requests with detailed summaries

### 🎯 Real-Time Progress
- Live log streaming from Devin sessions
- Progress indicators with status updates
- Structured result display with PR links

---

## 🚀 Quick Start for Reviewers

### Try the Live Demo

1. **Visit:** [https://devin-proj.vercel.app](https://devin-proj.vercel.app)
2. **Click:** The highlighted sample repo card (`Nadosaurusrex/devin_proj`)
3. **Navigate:** View feature flags from the test registry
4. **Analyze:** Click "Analyze" on any flag to see Devin in action
5. **Remove:** Trigger automated removal and watch the PR get created

**Note:** The demo uses a sample repository with pre-configured test data. The GitHub token is hardcoded for demo convenience (read-only access).

### Run Locally

```bash
# Prerequisites: Node.js 20+, pnpm
pnpm install

# Set up environment (optional for local dev)
cp .env.example .env
# Add your DEVIN_API_KEY and GITHUB_TOKEN if you want to test with real APIs
# Otherwise, the app runs in mock mode by default

# Start development server
pnpm dev

# Open http://localhost:3000
```

---

## 🏗️ Architecture Highlights

### Stateless Design (Vercel-Compatible)
- No server-side session storage
- Client-side polling of Devin sessions via API routes
- All state managed in-memory or client-side localStorage

### API Routes
- `GET /api/flags` - Fetch flags from GitHub registry
- `POST /api/analyze` - Create Devin analysis session
- `POST /api/remove` - Create Devin removal session with PR automation
- `GET /api/sessions/[id]` - Poll Devin session status (stateless proxy)

### Real-Time Streaming
- Client-side polling (1 second interval) for Devin session updates
- Full log re-parsing on each poll (simple & reliable)
- Completion detection via status flags + heuristics (PR URL presence)

### Error Handling
- Structured error responses with suggestions
- Graceful fallbacks (mock mode when APIs unavailable)
- User-friendly error messages with retry actions

---

## 🎨 UI/UX Decisions

### Design System
- **PrimeReact:** Enterprise-grade component library for rapid development
- **Framer Motion:** Smooth page transitions and micro-interactions
- **Tailwind CSS:** Utility-first styling with custom animations
- **Gradient Branding:** Purple/blue gradient for visual appeal

### User Flow
1. **Connect Page:** Quick-fill cards for sample repos, form validation
2. **Flags Page:** DataTable with search, pagination, and bulk actions
3. **Modals:** Analyze and Remove modals with clear explanations
4. **Job Details:** Live logs, progress bars, structured result cards

### Demo Enhancements
- Highlighted sample repo with "Try this!" badge
- Informative tooltips and help text throughout
- Links to GitHub files for transparency
- Behind-the-scenes context (prompts, instructions)

---

## 📝 Technical Decisions & Trade-offs

### Why Next.js App Router?
- Server-side API routes for secure API key handling
- Serverless deployment on Vercel (no infrastructure management)
- Built-in TypeScript support and great DX

### Why PrimeReact?
- Rich component library (DataTable, Dialog, Toast, etc.)
- Accessible out-of-the-box
- Faster development than building from scratch
- Professional look and feel

### Why Client-Side Polling?
- Vercel serverless functions have timeout limits (no long-lived WebSocket connections)
- Simple implementation, works reliably
- Easy to reason about (no complex state synchronization)

### Mock Mode
- Enables development without real API access
- Simulates Devin sessions with realistic delays
- Demonstrates functionality during interviews/demos

---

## 🧪 Testing & Quality

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Run all checks
pnpm check
```

**Type Safety:**
- Strict TypeScript throughout
- Typed API responses and Devin payloads
- No implicit `any` allowed

**Code Quality:**
- ESLint with Next.js recommended rules
- Consistent code formatting
- Clear naming conventions

---

## 🔐 Security Considerations

- API keys stored in environment variables (never exposed to client)
- GitHub token scoped to repository read/write only
- Devin API key passed securely via Authorization headers
- `.env` files excluded from version control
- No secrets logged or exposed in error messages

---

## 📦 Project Structure

```
├── app/
│   ├── api/              # Next.js API routes
│   │   ├── flags/        # Fetch flags from GitHub
│   │   ├── analyze/      # Create analysis session
│   │   ├── remove/       # Create removal session
│   │   └── sessions/     # Poll Devin session status
│   ├── connect/          # Repository connection page
│   ├── flags/            # Feature flags list page
│   ├── jobs/[id]/        # Job details with live logs
│   └── layout.tsx        # Root layout with navigation
├── components/           # Reusable React components
│   ├── FlagsTable.tsx    # DataTable with actions
│   ├── AnalyzeModal.tsx  # Analysis configuration modal
│   └── RemoveModal.tsx   # Removal configuration modal
├── lib/                  # Core business logic
│   ├── devin.ts          # Devin API client & mock sessions
│   ├── github.ts         # GitHub API helpers
│   └── jobs.ts           # In-memory job storage
├── types/                # TypeScript type definitions
│   ├── devin.ts          # Devin API types
│   ├── flags.ts          # Flag & API response types
│   └── jobs.ts           # Job status types
└── Justfile              # Task runner (dev, build, check)
```

---

## 🎯 What I Learned

### Working with Devin API
- Understanding session lifecycle and status polling
- Parsing unstructured LLM output for structured results
- Handling rate limits and timeout scenarios
- Detecting completion via heuristics when status lags

### Vercel Serverless Constraints
- Function timeout limits require stateless design
- No persistent WebSocket connections
- Need for aggressive cache-busting headers
- Client-side polling as a pragmatic solution

### UX for AI-Powered Tools
- Importance of progress visibility during long-running tasks
- Setting clear expectations about timing
- Providing context about what the AI is doing
- Graceful error handling with actionable recovery

---

## 🚧 Future Improvements

If I had more time, I'd add:

1. **Supabase Integration** - Persistent job history and repo connections
2. **Batch Operations** - Analyze/remove multiple flags at once
3. **GitHub App** - OAuth flow instead of PAT tokens
4. **Webhooks** - Real-time updates instead of polling
5. **Test Coverage** - Unit tests for critical paths
6. **Analytics** - Track success rates and common issues

---

## 📞 Contact

Built by **Nader Mohamed** for technical assessment
**Demo:** [https://devin-proj.vercel.app](https://devin-proj.vercel.app)
**Questions?** Feel free to reach out via the hiring team

---

## License

Private - For evaluation purposes only
