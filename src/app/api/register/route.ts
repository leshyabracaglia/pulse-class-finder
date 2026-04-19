import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { email, password, fullName } = body;

  if (!email || !password) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(profiles)
    .where(eq(profiles.email, email));
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Email already registered" },
      { status: 409 }
    );
  }

  const password_hash = await bcrypt.hash(password, 12);
  const id = crypto.randomUUID();

  await db.insert(profiles).values({
    id,
    email,
    full_name: fullName || null,
    password_hash,
  });

  return NextResponse.json({ id, email });
}
