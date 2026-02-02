import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/login");
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
