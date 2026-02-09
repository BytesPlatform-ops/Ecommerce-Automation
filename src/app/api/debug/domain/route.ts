import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

/**
 * DEBUG endpoint to diagnose domain lookup issues
 * GET /api/debug/domain?domain=example.com
 * 
 * This compares Prisma (direct DB) vs Supabase client results
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    // Get ALL stores with domains using Prisma (bypasses RLS)
    const allStoresWithDomains = await prisma.store.findMany({
      where: {
        domain: { not: null },
      },
      select: {
        id: true,
        subdomainSlug: true,
        domain: true,
        domainStatus: true,
        storeName: true,
      },
    });

    // If a specific domain was requested, try both methods
    let prismaResult = null;
    let supabaseResult = null;
    let supabaseError = null;

    if (domain) {
      const normalizedDomain = domain.trim().toLowerCase().replace(/^www\./, "").split(":")[0];

      // Method 1: Prisma (direct DB, bypasses RLS)
      prismaResult = await prisma.store.findFirst({
        where: { domain: normalizedDomain },
        select: {
          id: true,
          subdomainSlug: true,
          domain: true,
          domainStatus: true,
        },
      });

      // Method 2: Supabase client (uses RLS)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from("stores")
        .select("id, subdomainSlug, domain, domainStatus")
        .eq("domain", normalizedDomain)
        .maybeSingle();

      supabaseResult = data;
      supabaseError = error ? { message: error.message, code: error.code, details: error.details } : null;
    }

    // Check table info
    let tableInfo = null;
    try {
      // Get column names from the database
      const columns = await prisma.$queryRaw`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'stores'
        ORDER BY ordinal_position
      ` as Array<{ column_name: string; data_type: string }>;
      tableInfo = columns;
    } catch (e) {
      tableInfo = { error: String(e) };
    }

    // Check RLS status
    let rlsStatus = null;
    try {
      const rls = await prisma.$queryRaw`
        SELECT relrowsecurity, relforcerowsecurity 
        FROM pg_class 
        WHERE relname = 'stores'
      ` as Array<{ relrowsecurity: boolean; relforcerowsecurity: boolean }>;
      rlsStatus = rls[0] || { error: "Table not found" };
    } catch (e) {
      rlsStatus = { error: String(e) };
    }

    return NextResponse.json({
      debug: true,
      queriedDomain: domain,
      allStoresWithDomains,
      comparison: domain ? {
        prisma: prismaResult,
        supabase: supabaseResult,
        supabaseError,
        match: JSON.stringify(prismaResult) === JSON.stringify(supabaseResult),
      } : null,
      tableInfo,
      rlsStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
