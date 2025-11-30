import { NextRequest, NextResponse } from "next/server";

import { scrapeMonotributoCategories } from "@/lib/scrapers/monotributo";
import { performSecurityChecks } from "@/lib/security";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // Full security checks including Turnstile - scraper consumes server resources
  // Token is extracted from x-turnstile-token header by performSecurityChecks
  const securityCheck = await performSecurityChecks(request);
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
