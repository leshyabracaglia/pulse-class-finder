import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { bookings, profiles } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const class_id = searchParams.get("class_id");

  if (!class_id) {
    return NextResponse.json({ error: "Missing class_id" }, { status: 400 });
  }

  const classBookings = await db
    .select({ id: bookings.id, user_id: bookings.user_id, booked_at: bookings.booked_at })
    .from(bookings)
    .where(
      and(eq(bookings.class_id, class_id), eq(bookings.booking_status, "confirmed"))
    );

  if (classBookings.length === 0) {
    return NextResponse.json([]);
  }

  const userIds = classBookings.map((b) => b.user_id);
  const profileData = await db
    .select({ id: profiles.id, full_name: profiles.full_name, email: profiles.email })
    .from(profiles)
    .where(inArray(profiles.id, userIds));

  const profileMap: Record<string, { full_name: string; email: string }> = {};
  profileData.forEach((p) => {
    profileMap[p.id] = { full_name: p.full_name || "Unknown", email: p.email };
  });

  const result = classBookings.map((b) => ({
    id: b.id,
    booked_at: b.booked_at,
    full_name: profileMap[b.user_id]?.full_name || "Unknown",
    email: profileMap[b.user_id]?.email || "Unknown",
  }));

  return NextResponse.json(result);
}
