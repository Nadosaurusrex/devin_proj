# Justfile for Feature Flag Removal Dashboard
# Use `just <task>` to run commands safely

# Default recipe lists all available commands
default:
  @just --list

# Install dependencies
install:
  pnpm install

# Start development server
dev:
  pnpm next dev

# Build for production
build:
  pnpm next build

# Start production server
start:
  pnpm next start

# Run type checking
typecheck:
  pnpm tsc --noEmit

# Run linter
lint:
  pnpm next lint

# Format code (placeholder - add prettier if needed)
format:
  @echo "Format task placeholder - add prettier if needed"

# Run tests
test:
  pnpm vitest run

# Seed sample data (placeholder)
seed:
  @echo "Seed task placeholder - no DB in MVP"

# Run all checks (typecheck + lint + tests)
check:
  @echo "Running typecheck..."
  @just typecheck
  @echo "Running lint..."
  @just lint
  @echo "Running tests..."
  @just test
  @echo "All checks passed!"

# Clean build artifacts
clean:
  rm -rf .next
  rm -rf node_modules
  rm -rf .turbo
