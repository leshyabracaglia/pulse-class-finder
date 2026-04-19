import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const [booking] = await db
    .select({ user_id: bookings.user_id })
    .from(bookings)
    .where(eq(bookings.id, id));

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (booking.user_id !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let booking_status;
  try {
    ({ booking_status } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await db
    .update(bookings)
    .set({ booking_status })
    .where(eq(bookings.id, id));

  return NextResponse.json({ success: true });
}
