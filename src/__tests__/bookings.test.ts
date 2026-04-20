import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createBooking } from "@/app/api/bookings/route";
import { PUT as updateBooking } from "@/app/api/bookings/[id]/route";
import { db } from "@/db";
import { auth } from "@/lib/auth";

vi.mock("@/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

// Drizzle ORM helpers are pure functions — no need to mock them.
// The mocked db chain ignores the condition arguments passed to .where().

function makeChain(terminalReturn: unknown) {
  const chain: any = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.innerJoin = vi.fn().mockReturnValue(chain);
  chain.set = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockResolvedValue(terminalReturn);
  chain.values = vi.fn().mockResolvedValue(undefined);
  return chain;
}

const SESSION = { user: { id: "user-1", email: "test@example.com", name: "Test" } };

function postReq(body: object) {
  return new NextRequest("http://localhost/api/bookings", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function putReq(body: object) {
  return new NextRequest("http://localhost/api/bookings/booking-1", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/bookings", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await createBooking(postReq({ class_id: "class-1" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 409 when user already has a confirmed booking for the class", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ id: "existing" }]) as any);

    const res = await createBooking(postReq({ class_id: "class-1" }));

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: "Already booked" });
  });

  it("returns 404 when the class does not exist", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    // No duplicate booking
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);
    // Class not found
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);

    const res = await createBooking(postReq({ class_id: "class-1" }));

    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: "Class not found" });
  });

  it("returns 409 when the class is at full capacity", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    // No duplicate booking
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);
    // Class with capacity 2
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ max_capacity: 2 }]) as any);
    // 2 confirmed bookings already (= capacity)
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ id: "b1" }, { id: "b2" }]) as any);

    const res = await createBooking(postReq({ class_id: "class-1" }));

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: "Class is full" });
  });

  it("creates a booking and returns an id when class has capacity", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    // No duplicate booking
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);
    // Class with capacity 10
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ max_capacity: 10 }]) as any);
    // 3 existing confirmed bookings
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ id: "b1" }, { id: "b2" }, { id: "b3" }]) as any);
    const insertChain = makeChain(undefined);
    vi.mocked(db.insert).mockReturnValueOnce(insertChain as any);

    const res = await createBooking(postReq({ class_id: "class-1" }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ class_id: "class-1", user_id: "user-1", booking_status: "confirmed" })
    );
  });
});

describe("PUT /api/bookings/[id]", () => {
  const routeContext = { params: Promise.resolve({ id: "booking-1" }) };

  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await updateBooking(putReq({ booking_status: "cancelled" }), routeContext);

    expect(res.status).toBe(401);
  });

  it("returns 404 when booking does not exist", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);

    const res = await updateBooking(putReq({ booking_status: "cancelled" }), routeContext);

    expect(res.status).toBe(404);
  });

  it("returns 403 when booking belongs to a different user", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ user_id: "other-user" }]) as any);

    const res = await updateBooking(putReq({ booking_status: "cancelled" }), routeContext);

    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "Forbidden" });
  });

  it("cancels a booking and frees the spot when user owns it", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ user_id: "user-1" }]) as any);
    const updateChain = makeChain(undefined);
    vi.mocked(db.update).mockReturnValueOnce(updateChain as any);

    const res = await updateBooking(putReq({ booking_status: "cancelled" }), routeContext);

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(updateChain.set).toHaveBeenCalledWith({ booking_status: "cancelled" });
  });
});
