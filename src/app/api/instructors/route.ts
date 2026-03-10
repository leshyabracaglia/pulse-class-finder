import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organization_instructors } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const organization_uid = searchParams.get("organization_uid");

  if (!organization_uid) {
    return NextResponse.json({ error: "Missing organization_uid" }, { status: 400 });
  }

  const result = await db
    .select()
    .from(organization_instructors)
    .where(eq(organization_instructors.organization_uid, organization_uid));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { organization_uid, name, email, phone_number } = await req.json();
  const instructor_uid = crypto.randomUUID();

  await db.insert(organization_instructors).values({
    instructor_uid,
    organization_uid,
    name,
    email,
    phone_number,
  });

  return NextResponse.json({ instructor_uid, organization_uid, name, email, phone_number });
}
