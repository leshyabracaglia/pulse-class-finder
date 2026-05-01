import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(organizations)
    .where(eq(organizations.admin_uid, session.user.id));

  if (result.length === 0) {
    return NextResponse.json(null);
  }

  const o = result[0];
  return NextResponse.json({
    organization_uid: o.organization_uid,
    name: o.name,
    description: o.description,
    contactEmail: o.contact_email,
    phone: o.phone_number,
    address: o.address,
    website: o.website,
    wallet_address: o.wallet_address,
    logo_url: o.logo_url ?? null,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, description, contactEmail, phone, address, website, wallet_address, logo_url } = body;

  const organization_uid = crypto.randomUUID();
  await db.insert(organizations).values({
    organization_uid,
    admin_uid: session.user.id,
    name,
    description,
    contact_email: contactEmail,
    phone_number: phone,
    address,
    website,
    wallet_address: wallet_address || null,
    logo_url: logo_url || null,
  });

  return NextResponse.json({ organization_uid, name, description, contactEmail, phone, address, website, wallet_address: wallet_address || null, logo_url: logo_url || null });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { organization_uid, name, description, contactEmail, phone, address, website, wallet_address, logo_url } = body;

  await db
    .update(organizations)
    .set({ name, description, contact_email: contactEmail, phone_number: phone, address, website, wallet_address: wallet_address ?? null, logo_url: logo_url ?? null })
    .where(and(eq(organizations.organization_uid, organization_uid), eq(organizations.admin_uid, session.user.id)));

  return NextResponse.json({ success: true });
}
