import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Redirect to wherever the "next" param says (e.g. /reset-password)
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange failed, redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate. Please try again.`
  );
}
