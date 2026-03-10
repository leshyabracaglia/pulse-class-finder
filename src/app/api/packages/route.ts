import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { packages } from "@/db/schema";
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
    .from(packages)
    .where(eq(packages.organization_uid, organization_uid));

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const id = crypto.randomUUID();

  await db.insert(packages).values({ id, ...body });

  return NextResponse.json({ id, ...body });
}
