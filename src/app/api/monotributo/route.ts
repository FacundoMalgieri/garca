import { NextRequest, NextResponse } from "next/server";

import { scrapeMonotributoCategories } from "@/lib/scrapers/monotributo";
import { performBasicSecurityChecks } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Basic security checks: rate limiting + bot detection
  // Turnstile not required - this endpoint returns public data (monotributo categories)
  // and is protected by rate limiting (5 requests per minute) + client-side 24h cache
  const securityCheck = performBasicSecurityChecks(request);
  if (!securityCheck.allowed) {
    return securityCheck.response;
  }

  try {
    const data = await scrapeMonotributoCategories();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in monotributo API:", error);
    return NextResponse.json(
      { error: "Failed to fetch monotributo data" },
      { status: 500 }
    );
  }
}
