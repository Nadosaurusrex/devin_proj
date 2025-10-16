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
🚧 IN PROGRESS
