import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { classes, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

async function verifyClassOwnership(classId: string, userId: string) {
  const [row] = await db
    .select({ admin_uid: organizations.admin_uid })
    .from(classes)
    .innerJoin(organizations, eq(classes.organization_uid, organizations.organization_uid))
    .where(eq(classes.id, classId));
  if (!row) return "not_found";
  if (row.admin_uid !== userId) return "forbidden";
  return "ok";
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownership = await verifyClassOwnership(id, session.user.id);
  if (ownership === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ownership === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { title, class_time, class_date, max_capacity, instructor_uid, image_url } = body;

  await db
    .update(classes)
    .set({ title, class_time, class_date, max_capacity: Number(max_capacity), instructor_uid, image_url: image_url ?? null })
    .where(eq(classes.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const ownership = await verifyClassOwnership(id, session.user.id);
  if (ownership === "not_found") return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (ownership === "forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await db.delete(classes).where(eq(classes.id, id));

  return NextResponse.json({ success: true });
}
