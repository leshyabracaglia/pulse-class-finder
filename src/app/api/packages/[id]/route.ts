import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { packages, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyPackageOwnership(packageId: string, userId: string) {
  const [row] = await db
    .select({ admin_uid: organizations.admin_uid })
    .from(packages)
    .innerJoin(organizations, eq(packages.organization_uid, organizations.organization_uid))
    .where(eq(packages.id, packageId));
  if (!row) return "not_found";
  if (row.admin_uid !== userId) return "forbidden";
  return "ok";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownership = await verifyPackageOwnership(id, session.user.id);
  if (ownership === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ownership === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { name, description, package_type, class_count, duration_days, price_cents, is_active } = body;

  await db.update(packages).set({ name, description, package_type, class_count, duration_days, price_cents, is_active }).where(eq(packages.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownership = await verifyPackageOwnership(id, session.user.id);
  if (ownership === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ownership === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(packages).where(eq(packages.id, id));

  return NextResponse.json({ success: true });
}
