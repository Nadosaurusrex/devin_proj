import type {
  CreateSessionResponse,
  SessionStatusResponse,
  AnalyzeSessionParams,
  AnalysisResult,
  DevinSessionStatus,
  RemoveSessionParams,
  RemovalResult,
} from '@/types/devin'

/**
 * Devin API configuration
 */
const DEVIN_API_BASE = process.env.DEVIN_API_URL || 'https://api.devin.ai/v1'
const DEVIN_API_KEY = process.env.DEVIN_API_KEY
const DEVIN_MOCK_MODE = process.env.DEVIN_MOCK_MODE === 'true'

/**
 * Custom error for Devin API operations
 */
export class DevinApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'DevinApiError'
  }
}

/**
 * Build instruction for analyze-only session
 */
function buildAnalyzeInstruction(params: AnalyzeSessionParams): string {
  const { owner, repo, branch, flags, workingDir, patterns } = params

  return `You are an autonomous engineer analyzing deprecated feature flags. This is an ANALYZE-ONLY task - do not make any changes to the repository.

Repository: ${owner}/${repo}
Branch: ${branch}
${workingDir ? `Working Directory: ${workingDir}` : ''}

Flags to analyze: ${flags.join(', ')}

${patterns ? `File patterns to search: ${patterns.join(', ')}` : ''}

For each flag, provide:
1. All references in the codebase (file paths, line numbers, surrounding context)
2. Count of total references
3. List of affected files
4. Risk assessment (low/medium/high)
5. Confidence score (0-1)
6. Recommendation for removal

Output your analysis as a JSON object with this structure:
{
  "flags": [
    {
      "key": "flag_name",
      "references": [{"file": "path", "line": 123, "context": "code snippet"}],
      "reference_count": 5,
      "affected_files": ["file1.ts", "file2.ts"],
      "risk_level": "low",
      "confidence": 0.95,
      "recommendation": "Safe to remove - all references are simple conditionals"
    }
  ],
  "summary": {
    "total_flags": 1,
    "total_references": 5,
    "estimated_effort_hours": 2
  }
}

DO NOT make any changes to files. Only analyze and report.`
}

/**
 * Generate mock analysis result
 */
function generateMockAnalysis(params: AnalyzeSessionParams): AnalysisResult {
  const mockReferences = [
    'src/components/Dashboard.tsx',
    'src/services/featureFlags.ts',
    'src/utils/config.ts',
    'tests/feature-flags.test.ts',
  ]

  const flags = params.flags.map((flagKey, idx) => {
    const refCount = Math.floor(Math.random() * 10) + 1
    const affectedFiles = mockReferences.slice(0, Math.min(refCount, 4))
    const riskLevels = ['low', 'medium', 'high'] as const
    const risk = riskLevels[idx % 3]

    return {
      key: flagKey,
      references: affectedFiles.map((file, lineIdx) => ({
        file,
        line: (lineIdx + 1) * 42,
        context: `if (featureFlags.${flagKey}) { ... }`,
      })),
      reference_count: refCount,
      affected_files: affectedFiles,
      risk_level: risk,
      confidence: 0.85 + Math.random() * 0.15,
      recommendation:
        risk === 'low'
          ? 'Safe to remove - all references are simple conditionals'
          : risk === 'medium'
          ? 'Review carefully - some complex logic involved'
          : 'High risk - flag used in critical paths, extensive testing required',
    }
  })

  return {
    flags,
    summary: {
      total_flags: flags.length,
      total_references: flags.reduce((sum, f) => sum + f.reference_count, 0),
      estimated_effort_hours: flags.length * 2,
    },
  }
}

/**
 * Mock Devin session simulation
 */
class MockDevinSession {
  private sessionId: string
  private status: DevinSessionStatus = 'running'
  private result: AnalysisResult | null = null
  private logs: string[] = []

  constructor(private params: AnalyzeSessionParams) {
    this.sessionId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    this.simulateAnalysis()
  }

  private async simulateAnalysis() {
    // Simulate analysis with delays
    this.logs.push('[INFO] Starting analysis...')
    await this.delay(500)

    this.logs.push(`[INFO] Scanning ${this.params.flags.length} flags in ${this.params.owner}/${this.params.repo}`)
    await this.delay(800)

    for (const flag of this.params.flags) {
      this.logs.push(`[INFO] Analyzing flag: ${flag}`)
      await this.delay(400)
      this.logs.push(`[DEBUG] Found references in codebase`)
    }

    await this.delay(600)
    this.logs.push('[INFO] Generating analysis report...')
    await this.delay(300)

    this.result = generateMockAnalysis(this.params)
    this.status = 'completed'
    this.logs.push('[INFO] Analysis complete!')
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getSessionId(): string {
    return this.sessionId
  }

  getStatus(): DevinSessionStatus {
    return this.status
  }

  getLogs(): string[] {
    return [...this.logs]
  }

  getResult(): AnalysisResult | null {
    return this.result
  }
}

/**
 * Global mock sessions storage for singleton pattern
 */
declare global {
  // eslint-disable-next-line no-var
  var devinMockSessions: Map<string, MockDevinSession | MockDevinRemovalSession> | undefined
}

// Store mock sessions (both analyze and removal sessions) using global
const mockSessions = globalThis.devinMockSessions ?? new Map<string, MockDevinSession | MockDevinRemovalSession>()

if (!globalThis.devinMockSessions) {
  globalThis.devinMockSessions = mockSessions
}

/**
 * Create an analyze session with Devin
 */
export async function createAnalyzeSession(
  params: AnalyzeSessionParams
): Promise<{ sessionId: string }> {
  if (DEVIN_MOCK_MODE) {
    console.log('[MOCK] Creating mock Devin session')
    const mockSession = new MockDevinSession(params)
    const sessionId = mockSession.getSessionId()
    mockSessions.set(sessionId, mockSession)
    return { sessionId }
  }

  // Real Devin API implementation
  if (!DEVIN_API_KEY) {
    throw new DevinApiError('Devin API key not configured', 500)
  }

  const instruction = buildAnalyzeInstruction(params)

  // Real Devin API uses "prompt" not "instruction"
  const request = {
    prompt: instruction,
    repository_url: `https://github.com/${params.owner}/${params.repo}`,
    branch: params.branch,
  }

  try {
    const response = await fetch(`${DEVIN_API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEVIN_API_KEY}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new DevinApiError(
        `Failed to create Devin session: ${response.statusText}`,
        response.status,
        error
      )
    }

    const data = (await response.json()) as CreateSessionResponse
    return { sessionId: data.session_id }
  } catch (error) {
    if (error instanceof DevinApiError) {
      throw error
    }
    throw new DevinApiError(
      `Failed to create Devin session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      error
    )
  }
}

/**
 * Get session status and results
 */
export async function getSessionStatus(
  sessionId: string
): Promise<SessionStatusResponse> {
  if (DEVIN_MOCK_MODE) {
    const mockSession = mockSessions.get(sessionId)
    if (!mockSession) {
      throw new DevinApiError(`Session not found: ${sessionId}`, 404)
    }

    return {
      session_id: sessionId,
      status: mockSession.getStatus(),
      output: mockSession.getLogs().join('\n'),
      result: mockSession.getResult() || undefined,
    }
  }

  // Real Devin API implementation
  if (!DEVIN_API_KEY) {
    throw new DevinApiError('Devin API key not configured', 500)
  }

  try {
    const response = await fetch(`${DEVIN_API_BASE}/sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${DEVIN_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new DevinApiError(
        `Failed to get session status: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    // Transform real API response to our format
    const messages = data.messages || []
    const output = messages
      .filter((m: { type: string }) => m.type === 'devin_message')
      .map((m: { message: string }) => m.message)
      .join('\n')

    // Map Devin's status_enum to our status type
    const statusMap: Record<string, DevinSessionStatus> = {
      'running': 'running',
      'completed': 'completed',
      'blocked': 'running', // Treat blocked as running
      'failed': 'failed',
      'cancelled': 'cancelled',
    }

    // Try to extract structured result
    let result: AnalysisResult | RemovalResult | undefined = data.structured_output

    // If no structured output, try to fetch from attachments
    if (!result && data.attachments && data.attachments.length > 0 && statusMap[data.status_enum] === 'completed') {
      try {
        // Look for JSON attachment
        const jsonAttachment = data.attachments.find((att: { name: string; url: string }) =>
          att.name?.endsWith('.json')
        )
        if (jsonAttachment && jsonAttachment.url) {
          console.log('Fetching Devin attachment from:', jsonAttachment.url)
          const attachmentResponse = await fetch(jsonAttachment.url)
          if (attachmentResponse.ok) {
            result = await attachmentResponse.json()
            console.log('Successfully fetched Devin result from attachment')
          }
        }
      } catch (e) {
        console.error('Failed to fetch attachment from Devin:', e)
      }
    }

    // If still no result, try to extract JSON from the output text
    if (!result && output && statusMap[data.status_enum] === 'completed') {
      try {
        // Look for JSON in code blocks (```json ... ```)
        const jsonMatch = output.match(/```json\s*([\s\S]*?)\s*```/)
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1])
        } else {
          // Try to find JSON object in the text
          const objectMatch = output.match(/\{[\s\S]*"flags"[\s\S]*\}/)
          if (objectMatch) {
            result = JSON.parse(objectMatch[0])
          }
        }
      } catch (e) {
        // Failed to parse JSON from output, will remain undefined
        console.warn('Failed to parse JSON from Devin output:', e)
      }
    }

    return {
      session_id: data.session_id,
      status: statusMap[data.status_enum] || 'running',
      output,
      result,
    } as SessionStatusResponse
  } catch (error) {
    if (error instanceof DevinApiError) {
      throw error
    }
    throw new DevinApiError(
      `Failed to get session status: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      error
    )
  }
}

/**
 * Check if running in mock mode
 */
export function isMockMode(): boolean {
  return DEVIN_MOCK_MODE
}

/**
 * Build instruction for removal session
 */
function buildRemovalInstruction(params: RemoveSessionParams): string {
  const { owner, repo, branch, flags, targetBehavior, registryFiles, testCommand, buildCommand, workingDir } = params

  return `You are an autonomous engineer removing deprecated feature flags safely. Work with minimal diffs, run tests, and open a PR. Use GITHUB_TOKEN from env to push.

Repository: ${owner}/${repo}
Branch: ${branch}
${workingDir ? `Working Directory: ${workingDir}` : ''}

Flags to remove: ${flags.join(', ')}
Target Behavior: Replace all references with "${targetBehavior}" (inline as ${targetBehavior === 'on' ? 'always true' : 'always false'})
Registry Files: ${registryFiles.join(', ')}
${testCommand ? `Test Command: ${testCommand}` : ''}
${buildCommand ? `Build Command: ${buildCommand}` : ''}

Steps to follow:
1. Scan the codebase for all references to these flags
2. Inline the target behavior (replace flag checks with ${targetBehavior === 'on' ? 'true' : 'false'})
3. Remove the flags from registry files: ${registryFiles.join(', ')}
4. Update any tests that reference these flags
5. Run linter to fix formatting
${testCommand ? `6. Run tests: ${testCommand}` : '6. Skip tests (no test command provided)'}
${buildCommand ? `7. Run build: ${buildCommand}` : '7. Skip build (no build command provided)'}
8. Create a new branch (e.g., remove-flags-TIMESTAMP)
9. Commit changes with descriptive message
10. Push to GitHub using GITHUB_TOKEN
11. Open a Pull Request with title and description

Output your results as a JSON object with this structure:
{
  "pr_url": "https://github.com/owner/repo/pull/123",
  "branch": "remove-flags-20250116",
  "commit_message": "Remove deprecated flags: flag1, flag2",
  "summary": {
    "flags_removed": 2,
    "files_modified": 5,
    "tests_passed": true,
    "build_passed": true
  },
  "errors": []
}

IMPORTANT CONSTRAINTS:
- Do NOT leak GITHUB_TOKEN in logs or output
- If PR creation fails, output a unified diff instead:
  {
    "diff": "unified diff content here",
    "commit_message": "proposed commit message",
    "summary": { ... },
    "errors": ["Failed to push: permission denied"]
  }
- Open a DRAFT PR if tests or build fail, with explanation in the PR description
- Work with minimal diffs - only change what's necessary`
}

/**
 * Generate mock removal result
 */
function generateMockRemoval(params: RemoveSessionParams, shouldFail: boolean = false): RemovalResult {
  if (shouldFail) {
    // Simulate PR creation failure with diff fallback
    const diff = `diff --git a/src/components/Dashboard.tsx b/src/components/Dashboard.tsx
index 1234567..abcdefg 100644
--- a/src/components/Dashboard.tsx
+++ b/src/components/Dashboard.tsx
@@ -10,7 +10,7 @@ export function Dashboard() {
   const { user } = useAuth()

   return (
-    {featureFlags.${params.flags[0]} && <NewDashboard />}
+    {true && <NewDashboard />}
   )
 }

diff --git a/config/flags.json b/config/flags.json
index 9876543..fedcba9 100644
--- a/config/flags.json
+++ b/config/flags.json
@@ -1,6 +1,5 @@
 {
   "flags": [
-    { "key": "${params.flags[0]}", "state": "enabled" },
     { "key": "other_flag", "state": "disabled" }
   ]
 }`

    return {
      diff,
      commit_message: `Remove deprecated flags: ${params.flags.join(', ')}`,
      summary: {
        flags_removed: params.flags.length,
        files_modified: 4,
        tests_passed: true,
        build_passed: true,
      },
      errors: ['Failed to push to remote: permission denied. Please check GITHUB_TOKEN has write access.'],
    }
  }

  // Simulate successful PR creation
  const prNumber = Math.floor(Math.random() * 1000) + 100
  return {
    pr_url: `https://github.com/${params.owner}/${params.repo}/pull/${prNumber}`,
    branch: `remove-flags-${Date.now()}`,
    commit_message: `Remove deprecated flags: ${params.flags.join(', ')}

This PR removes ${params.flags.length} deprecated feature flag(s) and inlines their behavior as "${params.targetBehavior}".

Changes:
- Replaced all flag checks with ${params.targetBehavior === 'on' ? 'true' : 'false'}
- Updated registry files
- Updated tests

All tests passing ✓`,
    summary: {
      flags_removed: params.flags.length,
      files_modified: Math.floor(Math.random() * 8) + 2,
      tests_passed: true,
      build_passed: true,
    },
  }
}

/**
 * Mock Devin removal session
 */
class MockDevinRemovalSession {
  private sessionId: string
  private status: DevinSessionStatus = 'running'
  private result: RemovalResult | null = null
  private logs: string[] = []
  private shouldFail: boolean

  constructor(private params: RemoveSessionParams) {
    this.sessionId = `mock_remove_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // 20% chance of PR failure to test diff fallback
    this.shouldFail = Math.random() < 0.2
    this.simulateRemoval()
  }

  private async simulateRemoval() {
    this.logs.push('[INFO] Starting flag removal process...')
    await this.delay(500)

    this.logs.push(`[INFO] Scanning for ${this.params.flags.length} flags in ${this.params.owner}/${this.params.repo}`)
    await this.delay(800)

    for (const flag of this.params.flags) {
      this.logs.push(`[INFO] Removing flag: ${flag}`)
      await this.delay(400)
      this.logs.push(`[DEBUG] Inlining behavior as "${this.params.targetBehavior}"`)
      await this.delay(300)
    }

    this.logs.push('[INFO] Updating registry files...')
    await this.delay(600)

    if (this.params.testCommand) {
      this.logs.push(`[INFO] Running tests: ${this.params.testCommand}`)
      await this.delay(1000)
      this.logs.push('[INFO] All tests passed ✓')
    }

    if (this.params.buildCommand) {
      this.logs.push(`[INFO] Running build: ${this.params.buildCommand}`)
      await this.delay(800)
      this.logs.push('[INFO] Build successful ✓')
    }

    this.logs.push('[INFO] Creating branch and committing changes...')
    await this.delay(600)

    if (this.shouldFail) {
      this.logs.push('[WARN] Failed to push to remote - generating diff instead')
      await this.delay(400)
    } else {
      this.logs.push('[INFO] Pushing to GitHub...')
      await this.delay(700)
      this.logs.push('[INFO] Creating Pull Request...')
      await this.delay(500)
    }

    this.result = generateMockRemoval(this.params, this.shouldFail)
    this.status = 'completed'

    if (this.shouldFail) {
      this.logs.push('[INFO] Removal complete - diff generated (PR creation failed)')
    } else {
      this.logs.push(`[INFO] Removal complete - PR created: ${this.result.pr_url}`)
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getSessionId(): string {
    return this.sessionId
  }

  getStatus(): DevinSessionStatus {
    return this.status
  }

  getLogs(): string[] {
    return [...this.logs]
  }

  getResult(): RemovalResult | null {
    return this.result
  }
}

// Note: Mock removal sessions are stored in the main mockSessions Map above

/**
 * Create a removal session with Devin
 */
export async function createRemoveSession(
  params: RemoveSessionParams
): Promise<{ sessionId: string }> {
  if (DEVIN_MOCK_MODE) {
    console.log('[MOCK] Creating mock Devin removal session')
    const mockSession = new MockDevinRemovalSession(params)
    const sessionId = mockSession.getSessionId()
    mockSessions.set(sessionId, mockSession) // Store in global mock sessions map
    return { sessionId }
  }

  // Real Devin API implementation
  if (!DEVIN_API_KEY) {
    throw new DevinApiError('Devin API key not configured', 500)
  }

  const instruction = buildRemovalInstruction(params)

  // Get GitHub token from environment
  const githubToken = process.env.GITHUB_TOKEN
  if (!githubToken) {
    throw new DevinApiError('GITHUB_TOKEN not configured - required for PR creation', 500)
  }

  // Real Devin API uses "prompt" not "instruction"
  const request = {
    prompt: instruction,
    repository_url: `https://github.com/${params.owner}/${params.repo}`,
    branch: params.branch,
    environment_variables: {
      GITHUB_TOKEN: githubToken, // Pass as secret env var
    },
  }

  try {
    const response = await fetch(`${DEVIN_API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEVIN_API_KEY}`,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new DevinApiError(
        `Failed to create Devin removal session: ${response.statusText}`,
        response.status,
        error
      )
    }

    const data = (await response.json()) as CreateSessionResponse
    return { sessionId: data.session_id }
  } catch (error) {
    if (error instanceof DevinApiError) {
      throw error
    }
    throw new DevinApiError(
      `Failed to create Devin removal session: ${error instanceof Error ? error.message : 'Unknown error'}`,
      500,
      error
    )
  }
}
