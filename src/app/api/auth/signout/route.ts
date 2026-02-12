import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { logAudit, AuditAction } from "@/lib/audit";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    await logAudit({
      action: AuditAction.SignOut,
      actorId: user.id,
      resourceType: "Auth",
    });
  }

  await supabase.auth.signOut();
  return redirect("/login");
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
