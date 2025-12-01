import { getConcurrencyStats } from "@/lib/concurrency";

export function GET() {
  console.log("All good!");
  return Response.json({
    ok: true,
    timestamp: new Date().toISOString(),
    concurrency: getConcurrencyStats(),
  });
}

