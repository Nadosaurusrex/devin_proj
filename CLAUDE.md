CLAUDE.md

Purpose
- Use Claude Code to “vibe code” the Feature Flag Removal dashboard quickly, safely, and reproducibly.
- Keep Claude focused with small, testable tasks, and a fixed set of commands and file edits.
- This guide provides task cards, guardrails, prompts, and checklists you can paste into Claude Code.

Scope of the project
- Next.js (App Router, TypeScript) web app
- Lists feature flags from a registry file in a GitHub repo
- Triggers Devin sessions to analyze and remove flags, and to open a PR
- Optional persistence (Supabase) if time allows

Operating principles with Claude Code
- Always ask Claude to start with a plan: files to create/edit, commands to run, risks.
- Constrain shell execution to predefined tasks (via a Justfile or npm scripts).
- Prefer small diffs and atomic commits; make Claude show the diff before saving when possible.
- After each change: typecheck, lint, test, run the app; have Claude interpret failures and propose minimal fixes.
- Keep secrets out of logs and source control; confirm before writing any file containing secrets.

Setup before engaging Claude
- Create an empty GitHub repo for the demo (or a private one you control).
- Prepare a simple sample flags registry and code that references 2–3 flags.
- Ensure you have a GitHub PAT with repo scope for the sample repo.
- Gather API keys in local .env (do not commit):
  - DEVIN_API_KEY=...
  - GITHUB_TOKEN=...
  - Optional Supabase keys if used
- Node 20+, pnpm installed.
- Decide on the no-DB MVP for speed; Supabase is optional.

Project skeleton Claude should create
- Next.js app with App Router
- API routes:
  - GET /api/flags
  - POST /api/analyze
  - POST /api/remove
  - GET /api/jobs/[id]
  - GET /api/jobs/[id]/stream
- UI routes:
  - /connect
  - /flags
  - /jobs/[id]
- Core modules:
  - lib/github.ts (read registry, helpers)
  - lib/devin.ts (Devin client wrapper)
  - components: FlagsTable, AnalyzeModal, RemoveModal, JobStream
- Task runner: Justfile or package.json scripts for dev, build, test, typecheck, lint

Guardrails to remind Claude every session
- Plan before changes; list files and commands.
- Use pnpm and predefined scripts only; ask before adding dependencies.
- Keep TypeScript strict; no implicit any; no default exports for API handlers unless idiomatic.
- Never echo or log secrets; never commit .env; update .gitignore accordingly.
- If an external API is unavailable, generate a mock and a toggle to switch to real API later.
- For GitHub: use REST API for reads; for PR creation, Devin will push. If push fails, produce a patch as fallback.

Workspace bootstrap task card (paste to Claude)
- Goal: Scaffold a Next.js app with minimal dependencies and a task runner to safely orchestrate commands.
- Requirements:
  - Create a Next.js app (App Router, TypeScript) in ./app.
  - Add Tailwind and shadcn/ui if needed, but only if time allows; otherwise keep plain UI.
  - Add a Justfile with tasks: dev, build, test, typecheck, lint, format, start, seed, check.
  - Add package.json scripts mapping to these tasks.
  - Create .gitignore including .env, .next, node_modules.
  - Add basic pages: /connect, /flags, /jobs/[id] with placeholder components.
  - Add a README with run instructions and environment variables required.
- Constraints:
  - Use pnpm.
  - TypeScript strict mode.
  - No DB yet.
- After implementation:
  - Run just check (typecheck + lint).
  - Run just dev and confirm the app starts on localhost.
  - Provide a short summary and the diff.

GitHub integration task card
- Goal: Implement GET /api/flags to read a registry file from a GitHub repo.
- Inputs (query params): owner, repo, branch, registryPath (default config/flags.json)
- Behavior:
  - Fetch file via GitHub REST API contents endpoint; handle JSON or YAML; return an array of flags.
  - On 404 or parse error, return structured error with suggestions.
- Helpers:
  - lib/github.ts with getFileContent(owner, repo, path, ref, token?) that returns text; handle base64 decoding for contents API.
- Tests:
  - Unit test parsing JSON and YAML samples (store fixtures locally).
- Constraints:
  - Do not log tokens.
  - Token passed via server-side env GITHUB_TOKEN if not provided by the client; allow client-supplied token only if explicitly enabled.
- After implementation:
  - Typecheck, run tests.
  - Manual test with a sample public repo + sample flags.json.

Analyze flow task card
- Goal: Implement POST /api/analyze to initiate a Devin analysis session and stream results.
- Inputs: owner, repo, branch, flags[], workingDir?, patterns? (optional)
- Behavior:
  - Call a wrapper in lib/devin.ts to create a session with an “analyze only” instruction.
  - Return a jobId and a stream URL clients can connect to (SSE or long-poll).
- Stream:
  - Add GET /api/jobs/[id]/stream to proxy Devin logs to the client.
- UI:
  - Add AnalyzeModal and a button in FlagsTable to trigger analyze for one flag.
  - Display reference counts, affected files, risk/confidence summary.
- Constraints:
  - No writes to the repo in analyze mode.
  - Structure expected JSON output for easy parsing.
- After implementation:
  - Start a mock Devin backend if real API isn’t ready; toggle via env.
  - E2E test in dev against mock: analyze a flag and render summary.

Remove flow task card
- Goal: Implement POST /api/remove to instruct Devin to remove selected flags and open a PR.
- Inputs: owner, repo, branch, flags[], targetBehavior ("on" | "off"), registryFiles[], testCommand?, buildCommand?, workingDir?
- Behavior:
  - Create a Devin session with the removal instructions; pass GITHUB_TOKEN as a secret env.
  - Return jobId and stream URL; stream logs and final JSON containing pr_url, branch, summary.
- UI:
  - RemoveModal with form fields; on submit, navigate to /jobs/[id] to watch logs; show PR link on success.
- Constraints:
  - Mask tokens; never include in logs.
  - If PR creation fails, ask Devin to output a unified diff and proposed commit message; display it and optionally allow server-side apply later (placeholder).
- After implementation:
  - Test against a sandbox repo with a trivial flag reference and simple test suite.
  - Confirm PR is created with expected title/body.

Devin instruction template (for lib/devin.ts)
- Role: You are an autonomous engineer removing deprecated feature flags safely. Work with minimal diffs, run tests, and open a PR. Use GITHUB_TOKEN from env to push.
- Variables we provide: repo URL, base branch, flags[], target_behavior, registry_files[], test_command, build_command, working_directory.
- Steps: scan refs; inline target behavior; update registry; adjust tests; run linter/tests/build; create branch and PR; output structured JSON with pr_url and summaries.
- Constraints: do not leak tokens; open draft PR if tests fail with explanation.

Flags UI task card
- Goal: Implement a simple flags table with actions.
- Behavior:
  - Columns: key, state, description, last modified (from registry or GitHub file metadata), actions (Analyze, Remove).
  - Connect page: inputs for owner, repo, branch, registryPath; store in local state (optionally localStorage).
- Extras:
  - Skeletal loaders; inline error messages; link to registry file source.

Streaming and jobs page task card
- Goal: Implement /jobs/[id] to render real-time logs and final results.
- Behavior:
  - Connect to GET /api/jobs/[id]/stream via EventSource (SSE).
  - Render incremental logs; parse final JSON artifact for pr_url and summaries.
  - Provide a “Copy PR link” button; show a retry action if failed.

Optional Supabase persistence task card
- Goal: Add rehydration of repos and jobs.
- Tables: repos, jobs (id, type, flags, status, devin_session_id, pr_url, created_at).
- UI: a simple history table on /flags or a /jobs list.
- Keep this out of the critical path; only add if time permits.

Security checklist for Claude to enforce
- .env must never be committed; add to .gitignore.
- Never print env values in logs.
- Validate and sanitize any client-supplied repo inputs; only allow whitelisted repos in demo.
- Limit PAT scope to the sample repo; rotate after demo.
- If a command would expose secrets, stop and ask for confirmation.

Definition of done per feature
- Code compiles (typecheck clean)
- Tests pass (or clear reason if not applicable)
- Manual path works: connect -> list flags -> analyze -> remove -> PR URL
- No secrets in repo or logs
- Minimal dependencies; no unused packages
- README updated with usage