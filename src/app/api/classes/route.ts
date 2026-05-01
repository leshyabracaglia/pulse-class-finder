import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { classes, bookings, organization_instructors, organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const [classesData, bookingsData, instructorsData, orgsData] =
    await Promise.all([
      db.select().from(classes),
      db
        .select({ class_id: bookings.class_id })
        .from(bookings)
        .where(eq(bookings.booking_status, "confirmed")),
      db
        .select({
          instructor_uid: organization_instructors.instructor_uid,
          name: organization_instructors.name,
          photo_url: organization_instructors.photo_url,
        })
        .from(organization_instructors),
      db
        .select({
          organization_uid: organizations.organization_uid,
          name: organizations.name,
        })
        .from(organizations),
    ]);

  const countMap: Record<string, number> = {};
  bookingsData.forEach((b) => {
    countMap[b.class_id] = (countMap[b.class_id] || 0) + 1;
  });

  const instructorMap: Record<string, { name: string; photo_url: string | null }> = {};
  instructorsData.forEach((i) => {
    instructorMap[i.instructor_uid] = { name: i.name, photo_url: i.photo_url };
  });

  const orgMap: Record<string, string> = {};
  orgsData.forEach((o) => {
    orgMap[o.organization_uid] = o.name;
  });

  const result = classesData.map((c) => ({
    ...c,
    current_bookings: countMap[c.id] || 0,
    instructor_name: instructorMap[c.instructor_uid]?.name,
    instructor_photo_url: instructorMap[c.instructor_uid]?.photo_url,
    organization_name: orgMap[c.organization_uid],
  }));

  return NextResponse.json(result);
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
  const { title, class_time, class_date, max_capacity, price_cents, instructor_uid, organization_uid, image_url } = body;

  const id = crypto.randomUUID();
  await db.insert(classes).values({
    id,
    organization_uid,
    instructor_uid,
    title,
    class_date,
    class_time,
    max_capacity: Number(max_capacity),
    price_cents: Number(price_cents || 0),
    image_url: image_url || null,
  });

  return NextResponse.json({ id, organization_uid, instructor_uid, title, class_date, class_time, max_capacity, price_cents: Number(price_cents || 0), current_bookings: 0, image_url: image_url || null });
}
