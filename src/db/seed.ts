/**
 * Seed script for local/test development.
 * Creates two test accounts plus a sample org, instructors, classes, packages, and a booking.
 *
 * Credentials:
 *   User:             user@test.com     / password123
 *   Business manager: manager@test.com  / password123
 *
 * Run with: npm run db:seed
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import bcrypt from "bcryptjs";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import * as schema from "./schema";

const db = drizzle(sql, { schema });

const USER_ID = "seed-user-001";
const MANAGER_ID = "seed-manager-001";
const ORG_ID = "seed-org-001";
const INSTRUCTOR_1_ID = "seed-instructor-001";
const INSTRUCTOR_2_ID = "seed-instructor-002";

async function seed() {
  console.log("Seeding database...");

  const hash = await bcrypt.hash("password123", 10);

  // Profiles
  await db
    .insert(schema.profiles)
    .values([
      {
        id: USER_ID,
        email: "user@test.com",
        full_name: "Test User",
        password_hash: hash,
      },
      {
        id: MANAGER_ID,
        email: "manager@test.com",
        full_name: "Test Manager",
        password_hash: hash,
      },
    ])
    .onConflictDoNothing();

  // Organization (owned by manager)
  await db
    .insert(schema.organizations)
    .values({
      organization_uid: ORG_ID,
      admin_uid: MANAGER_ID,
      name: "Pulse Fitness Studio",
      description: "A test fitness studio for development",
      contact_email: "manager@test.com",
      phone_number: "555-0100",
      address: "123 Main St, San Francisco, CA",
    })
    .onConflictDoNothing();

  // Instructors
  await db
    .insert(schema.organization_instructors)
    .values([
      {
        instructor_uid: INSTRUCTOR_1_ID,
        organization_uid: ORG_ID,
        name: "Alex Rivera",
        email: "alex@pulsefitness.com",
        phone_number: "555-0101",
      },
      {
        instructor_uid: INSTRUCTOR_2_ID,
        organization_uid: ORG_ID,
        name: "Jamie Chen",
        email: "jamie@pulsefitness.com",
        phone_number: "555-0102",
      },
    ])
    .onConflictDoNothing();

  // Classes — a mix of upcoming and past dates relative to today
  const today = new Date();
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const addDays = (d: Date, n: number) =>
    new Date(d.getTime() + n * 86400000);

  await db
    .insert(schema.classes)
    .values([
      {
        id: "seed-class-001",
        organization_uid: ORG_ID,
        instructor_uid: INSTRUCTOR_1_ID,
        title: "Morning Yoga",
        class_date: fmt(addDays(today, 1)),
        class_time: "07:00",
        max_capacity: 15,
      },
      {
        id: "seed-class-002",
        organization_uid: ORG_ID,
        instructor_uid: INSTRUCTOR_2_ID,
        title: "HIIT Bootcamp",
        class_date: fmt(addDays(today, 2)),
        class_time: "09:00",
        max_capacity: 20,
      },
      {
        id: "seed-class-003",
        organization_uid: ORG_ID,
        instructor_uid: INSTRUCTOR_1_ID,
        title: "Pilates Core",
        class_date: fmt(addDays(today, 3)),
        class_time: "11:00",
        max_capacity: 12,
      },
      {
        id: "seed-class-004",
        organization_uid: ORG_ID,
        instructor_uid: INSTRUCTOR_2_ID,
        title: "Spin Class",
        class_date: fmt(addDays(today, 5)),
        class_time: "18:00",
        max_capacity: 25,
      },
      {
        id: "seed-class-005",
        organization_uid: ORG_ID,
        instructor_uid: INSTRUCTOR_1_ID,
        title: "Evening Stretch",
        class_date: fmt(addDays(today, -2)),
        class_time: "19:00",
        max_capacity: 10,
      },
    ])
    .onConflictDoNothing();

  // Packages
  await db
    .insert(schema.packages)
    .values([
      {
        id: "seed-package-001",
        organization_uid: ORG_ID,
        name: "10-Class Pack",
        description: "Buy 10 classes at a discount",
        package_type: "class_pack",
        class_count: 10,
        price_cents: 15000,
        is_active: true,
      },
      {
        id: "seed-package-002",
        organization_uid: ORG_ID,
        name: "Monthly Unlimited",
        description: "Unlimited classes for 30 days",
        package_type: "unlimited",
        duration_days: 30,
        price_cents: 9900,
        is_active: true,
      },
    ])
    .onConflictDoNothing();

  // Booking — test user is booked into Morning Yoga
  await db
    .insert(schema.bookings)
    .values({
      id: "seed-booking-001",
      class_id: "seed-class-001",
      user_id: USER_ID,
      booking_status: "confirmed",
    })
    .onConflictDoNothing();

  // User package — test user has the 10-class pack with 9 remaining
  const expires = addDays(today, 90);
  await db
    .insert(schema.user_packages)
    .values({
      id: "seed-user-package-001",
      user_id: USER_ID,
      package_id: "seed-package-001",
      organization_uid: ORG_ID,
      remaining_classes: 9,
      expires_at: expires,
      is_active: true,
    })
    .onConflictDoNothing();

  console.log("Done! Test accounts:");
  console.log("  User:    user@test.com    / password123");
  console.log("  Manager: manager@test.com / password123");
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
