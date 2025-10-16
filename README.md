# Feature Flag Removal Dashboard

Automated feature flag analysis and removal powered by Devin AI and GitHub integration.

## Overview

This Next.js application helps engineering teams safely remove deprecated feature flags by:
1. Connecting to a GitHub repository
2. Reading feature flag registries
3. Analyzing flag usage with Devin AI
4. Automating safe removal and creating PRs

## Prerequisites

- Node.js 20+
- pnpm (install via `npm install -g pnpm`)
- [just](https://github.com/casey/just) command runner (install via `brew install just` or `cargo install just`)

## Environment Variables

Create a `.env` file in the root with the following variables:

```bash
# GitHub Personal Access Token (with repo scope)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxx

# Devin API Key
DEVIN_API_KEY=devin_xxxxxxxxxxxxxxxxxxxxx

# Optional: Supabase (for persistence - not in MVP)
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
```

**Important:** Never commit the `.env` file to version control.

## Getting Started

### 1. Install Dependencies

```bash
just install
# or: pnpm install
```

### 2. Run Development Server

```bash
just dev
# or: pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Checks

```bash
just check
# Runs typecheck + lint
```

## Available Commands

All commands are defined in the `Justfile` and can be run with `just <command>`:

- `just dev` - Start development server
- `just build` - Build for production
- `just start` - Start production server
- `just typecheck` - Run TypeScript type checking
- `just lint` - Run ESLint
- `just format` - Format code (placeholder)
- `just test` - Run tests (placeholder)
- `just check` - Run all checks (typecheck + lint)
- `just clean` - Remove build artifacts

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── connect/         # Repository connection page
│   ├── flags/           # Feature flags list page
│   ├── jobs/[id]/       # Job details and logs page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── components/          # React components (to be added)
├── lib/                 # Core logic (to be added)
│   ├── github.ts        # GitHub API helpers
│   └── devin.ts         # Devin API wrapper
├── types/               # TypeScript type definitions
├── .env                 # Environment variables (DO NOT COMMIT)
├── Justfile             # Task runner configuration
└── CLAUDE.md            # Instructions for Claude Code
```

## Usage Flow

1. **Connect Repository** - Go to `/connect` and enter your GitHub repo details
2. **View Flags** - Browse feature flags from your registry at `/flags`
3. **Analyze** - Click "Analyze" to get Devin's impact assessment
4. **Remove** - Click "Remove" to trigger automated cleanup and PR creation
5. **Review PR** - Check the generated PR and merge when ready

## Security Notes

- Never log or expose API tokens in the application
- GitHub tokens should have minimal required scopes (repo read/write)
- Rotate tokens after demos or if compromised
- Use environment variables for all sensitive data

## Development Principles

- **Strict TypeScript** - No implicit any, full type safety
- **Minimal diffs** - Small, focused changes
- **No secrets in logs** - Sanitize all output
- **Test before commit** - Run `just check` before committing

## Next Steps

See `TASK.md` for the current implementation status and next tasks.

## License

Private - Internal use only
