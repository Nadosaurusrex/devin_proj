import { NextRequest, NextResponse } from 'next/server'
import { getSessionStatus } from '@/lib/devin'
import type { ErrorResponse } from '@/types/flags'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/sessions/[id]
 *
 * Stateless endpoint for polling Devin session status (Vercel-compatible)
 * This endpoint requires no server-side state - it just proxies to Devin API
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: sessionId } = await params

  try {
    // Get session status directly from Devin API
    const sessionStatus = await getSessionStatus(sessionId)

    // Return Devin session data with explicit no-cache headers
    return NextResponse.json(
      {
        sessionId,
        status: sessionStatus.status,
        output: sessionStatus.output,
        result: sessionStatus.result,
        error: sessionStatus.error,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    )

  } catch (error) {
    const errorResponse: ErrorResponse = {
      error: 'SESSION_ERROR',
      message: error instanceof Error ? error.message : 'Failed to get session status',
      statusCode: 500
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}
