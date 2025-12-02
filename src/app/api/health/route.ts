/**
 * Health check endpoint.
 * Returns minimal info - no internal stats exposed publicly.
 */
export function GET() {
  return Response.json({
    ok: true,
    timestamp: new Date().toISOString(),
  });
}

