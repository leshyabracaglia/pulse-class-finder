import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  full_name: text("full_name"),
  password_hash: text("password_hash"),
  wallet_address: text("wallet_address").unique(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const organizations = pgTable("organizations", {
  organization_uid: text("organization_uid").primaryKey(),
  admin_uid: text("admin_uid").notNull(),
  name: text("name").notNull(),
  logo_url: text("logo_url"),
  wallet_address: text("wallet_address"),
  description: text("description"),
  contact_email: text("contact_email"),
  phone_number: text("phone_number"),
  address: text("address"),
  website: text("website"),
  created_at: timestamp("created_at").defaultNow(),
});

export const organization_instructors = pgTable("organization_instructors", {
  instructor_uid: text("instructor_uid").primaryKey(),
  organization_uid: text("organization_uid").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone_number: text("phone_number").notNull(),
  photo_url: text("photo_url"),
});

export const classes = pgTable("classes", {
  id: text("id").primaryKey(),
  organization_uid: text("organization_uid").notNull(),
  instructor_uid: text("instructor_uid").notNull(),
  title: text("title").notNull(),
  class_date: text("class_date").notNull(),
  class_time: text("class_time").notNull(),
  max_capacity: integer("max_capacity").notNull(),
  price_cents: integer("price_cents").default(0).notNull(),
  image_url: text("image_url"),
  created_at: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  class_id: text("class_id").notNull(),
  user_id: text("user_id").notNull(),
  booking_status: text("booking_status").default("confirmed"),
  booked_at: timestamp("booked_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: text("id").primaryKey(),
  organization_uid: text("organization_uid").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  package_type: text("package_type").notNull(),
  class_count: integer("class_count"),
  duration_days: integer("duration_days"),
  price_cents: integer("price_cents").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const user_packages = pgTable("user_packages", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull(),
  package_id: text("package_id").notNull(),
  organization_uid: text("organization_uid").notNull(),
  remaining_classes: integer("remaining_classes"),
  expires_at: timestamp("expires_at"),
  stripe_payment_intent_id: text("stripe_payment_intent_id"),
  is_active: boolean("is_active").default(true),
  purchased_at: timestamp("purchased_at").defaultNow(),
});
