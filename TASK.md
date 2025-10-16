# Task: Bootstrap Feature Flag Removal Dashboard

## Goal
Scaffold a Next.js app with minimal dependencies and a task runner to safely orchestrate commands.

## Requirements
- [x] Create a Next.js app (App Router, TypeScript)
- [x] Add Tailwind CSS for styling
- [x] Add a Justfile with tasks: dev, build, test, typecheck, lint, format, start, seed, check
- [x] Add package.json scripts mapping to these tasks
- [x] Ensure .gitignore includes .env, .next, node_modules
- [x] Add basic pages: /connect, /flags, /jobs/[id] with placeholder components
- [x] Add a README with run instructions and environment variables required

## Constraints
- Use pnpm
- TypeScript strict mode
- No DB yet
- Never log secrets or commit .env

## After Implementation
- [x] Run `just check` (typecheck + lint)
- [x] Run `just dev` and confirm the app starts on localhost
- [x] Provide a short summary and the diff

## Status
✅ COMPLETED - Bootstrap successful

## Files Created
- All Next.js scaffold files, configs, pages, and documentation

---

# Task: GitHub Integration - Flags API

## Goal
Implement GET /api/flags to read a registry file from a GitHub repository and parse JSON/YAML feature flags.

## Requirements
- [ ] Create `lib/github.ts` with helper functions
  - `getFileContent(owner, repo, path, ref, token?)` - fetch and decode file from GitHub
  - Handle base64 decoding from GitHub Contents API
  - Type-safe error handling
- [ ] Create `app/api/flags/route.ts` as GET endpoint
  - Query params: owner, repo, branch (optional), registryPath (default: config/flags.json)
  - Parse JSON and YAML registries
  - Return structured array of flags
  - Return helpful errors on 404 or parse failures
- [ ] Create TypeScript types
  - `types/flags.ts` - Flag, FlagsResponse, ErrorResponse interfaces
  - `types/github.ts` - GitHub API response types
- [ ] Add YAML parsing library
  - Install `js-yaml` and `@types/js-yaml`
- [ ] Create test fixtures
  - `__fixtures__/flags.json` - sample JSON registry
  - `__fixtures__/flags.yaml` - sample YAML registry
- [ ] Add vitest for unit testing
  - Configure vitest
  - Test JSON parsing
  - Test YAML parsing
  - Test error cases
- [ ] Update Justfile test command to run vitest

## Constraints
- **NEVER log tokens** - sanitize all API errors
- Use server-side `GITHUB_TOKEN` from .env (not client-supplied)
- Strict TypeScript - all params and returns typed
- Minimal dependencies - only add js-yaml and vitest

## Implementation Plan

### Phase 1: Types and Helpers
1. Define Flag, FlagsResponse types
2. Create lib/github.ts with getFileContent
3. Handle GitHub API errors gracefully

### Phase 2: API Route
1. Create GET /api/flags route handler
2. Parse query params with validation
3. Fetch file via lib/github
4. Parse JSON/YAML based on file extension or content
5. Return normalized flags array

### Phase 3: Testing
1. Add vitest config
2. Create test fixtures
3. Write unit tests for parsing logic
4. Test error scenarios

### Phase 4: Verification
- [ ] Run `pnpm typecheck` - must pass
- [ ] Run `pnpm test` - all tests pass
- [ ] Manual test with public repo
- [ ] Verify no tokens in logs

## After Implementation
- [ ] Typecheck clean
- [ ] Tests passing
- [ ] Manual test successful
- [ ] Document API in README or separate API.md

## Status
✅ COMPLETED - All tests passing, API verified

---

# Task: Analyze Flow - Devin Integration & SSE

## Goal
Implement POST /api/analyze to create Devin analysis sessions and GET /api/jobs/[id]/stream for real-time log streaming via SSE.

## Requirements
- [ ] Create `types/devin.ts` with Devin API types
- [ ] Create `types/jobs.ts` with job state types
- [ ] Create `lib/devin.ts` with Devin client
  - `createAnalyzeSession()` - create analyze-only session
  - `getSessionStatus()` - poll session status
  - `streamSessionLogs()` - get incremental logs
  - Mock mode toggle via `DEVIN_MOCK_MODE` env var
- [ ] Create `lib/jobs.ts` for in-memory job storage
  - Store job state (id, status, logs, results)
  - Retrieve job by id
- [ ] Create `app/api/analyze/route.ts` as POST endpoint
  - Input: owner, repo, branch, flags[], workingDir?, patterns?
  - Create Devin session with "analyze only" instructions
  - Return jobId and streamUrl
- [ ] Create `app/api/jobs/[id]/stream/route.ts` as GET endpoint
  - SSE (Server-Sent Events) endpoint
  - Stream logs incrementally
  - Send final results when complete
- [ ] Add mock Devin implementation
  - Generate fake reference counts
  - Simulate affected files
  - Provide risk/confidence scores

## Constraints
- **No writes** to repo in analyze mode
- **Structure JSON output** for easy parsing
- **Mock by default** - toggle with env var
- In-memory storage only (no DB in MVP)

## Implementation Plan

### Phase 1: Types
1. Define Devin API request/response types
2. Define Job state types
3. Define analyze session parameters

### Phase 2: Devin Client
1. Create lib/devin.ts with real API client
2. Add mock implementation
3. Toggle based on env var

### Phase 3: Job Storage
1. In-memory Map for jobs
2. CRUD operations for jobs
3. Log accumulation logic

### Phase 4: API Routes
1. POST /api/analyze - initiate analysis
2. GET /api/jobs/[id]/stream - SSE streaming

### Phase 5: Testing
- [ ] Test mock mode with sample flags
- [ ] Verify SSE streaming works
- [ ] Test error handling
- [ ] Manual E2E test via curl/browser

## After Implementation
- [ ] Typecheck clean
- [ ] Tests passing
- [ ] Mock mode works end-to-end
- [ ] SSE streams correctly

## Status
✅ COMPLETED - Mock and real mode both working

---

# Task: Remove Flow - PR Creation & Diff Fallback

## Goal
Implement POST /api/remove to instruct Devin to remove flags safely and create a PR. Stream logs via existing SSE endpoint. Parse final JSON for PR URL or provide unified diff as fallback.

## Requirements
- [ ] Add removal types to `types/devin.ts`
- [ ] Create `createRemoveSession()` in `lib/devin.ts`
  - Build removal instruction with template from CLAUDE.md
  - Pass GITHUB_TOKEN as secret env variable
  - Include all removal parameters
- [ ] Create `app/api/remove/route.ts` as POST endpoint
  - Input: owner, repo, branch, flags[], targetBehavior, registryFiles[], testCommand?, buildCommand?, workingDir?
  - Create job and Devin session
  - Return jobId and streamUrl
- [ ] Update mock implementation
  - Generate fake PR URL
  - Or generate unified diff if "PR fails"
- [ ] Update SSE streaming to parse removal results
  - Extract pr_url, branch, summary from structured_output
  - Handle diff fallback case

## Constraints
- **Mask tokens** - Never log GITHUB_TOKEN
- **Structured output** - Parse JSON with pr_url, branch, summary
- **Fallback handling** - If PR creation fails, provide unified diff
- Use existing `/api/jobs/[id]/stream` endpoint

## Implementation Plan

### Phase 1: Types
1. Add RemovalResult type
2. Add RemoveSessionParams type

### Phase 2: Removal Client
1. Build removal instruction from template
2. Implement createRemoveSession() with real API
3. Add mock implementation with PR URL or diff

### Phase 3: API Route
1. Create POST /api/remove
2. Validate inputs (targetBehavior, flags, etc.)
3. Create job with type='remove'
4. Start Devin session asynchronously

### Phase 4: Testing
- [ ] Test mock mode with PR success
- [ ] Test mock mode with diff fallback
- [ ] Verify SSE parses removal results
- [ ] Typecheck clean

## After Implementation
- [ ] Typecheck passing
- [ ] Mock mode E2E working
- [ ] Can parse PR URL from results
- [ ] Can parse diff from results

## Status
🚧 IN PROGRESS
