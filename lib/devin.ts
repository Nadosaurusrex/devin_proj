import type {
  CreateSessionRequest,
  CreateSessionResponse,
  SessionStatusResponse,
  AnalyzeSessionParams,
  AnalysisResult,
  DevinSessionStatus,
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

// Store mock sessions
const mockSessions = new Map<string, MockDevinSession>()

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

    return {
      session_id: data.session_id,
      status: statusMap[data.status_enum] || 'running',
      output,
      result: data.structured_output || undefined,
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
