import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select({ id: profiles.id, email: profiles.email, full_name: profiles.full_name })
    .from(profiles)
    .where(eq(profiles.id, session.user.id));

  return NextResponse.json(result[0] || null);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { full_name } = await req.json();

  await db
    .update(profiles)
    .set({ full_name, updated_at: new Date() })
    .where(eq(profiles.id, session.user.id));

  return NextResponse.json({ success: true });
}
