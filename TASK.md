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
- [ ] Run `just check` (typecheck + lint)
- [ ] Run `just dev` and confirm the app starts on localhost
- [ ] Provide a short summary and the diff

## Status
In progress - bootstrapping project

## Files Created
- TASK.md
- (Next.js scaffold to follow)
