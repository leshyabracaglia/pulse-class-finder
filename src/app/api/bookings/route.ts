import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, classes } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userBookings = await db
    .select({
      id: bookings.id,
      class_id: bookings.class_id,
      booking_status: bookings.booking_status,
      booked_at: bookings.booked_at,
      class_title: classes.title,
      class_time: classes.class_time,
      class_date: classes.class_date,
      max_capacity: classes.max_capacity,
      instructor_uid: classes.instructor_uid,
    })
    .from(bookings)
    .innerJoin(classes, eq(bookings.class_id, classes.id))
    .where(
      and(
        eq(bookings.user_id, session.user.id),
        eq(bookings.booking_status, "confirmed")
      )
    );

  return NextResponse.json(userBookings);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let class_id;
  try {
    ({ class_id } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.class_id, class_id),
        eq(bookings.user_id, session.user.id),
        eq(bookings.booking_status, "confirmed")
      )
    );

  if (existing.length > 0) {
    return NextResponse.json({ error: "Already booked" }, { status: 409 });
  }

  const [classRow] = await db
    .select({ max_capacity: classes.max_capacity })
    .from(classes)
    .where(eq(classes.id, class_id));

  if (!classRow) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const confirmedBookings = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(and(eq(bookings.class_id, class_id), eq(bookings.booking_status, "confirmed")));

  if (confirmedBookings.length >= classRow.max_capacity) {
    return NextResponse.json({ error: "Class is full" }, { status: 409 });
  }

  const id = crypto.randomUUID();
  await db.insert(bookings).values({
    id,
    class_id,
    user_id: session.user.id,
    booking_status: "confirmed",
  });

  return NextResponse.json({ id });
}
