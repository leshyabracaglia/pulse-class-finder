import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createClass } from "@/app/api/classes/route";
import { PUT as updateClass, DELETE as deleteClass } from "@/app/api/classes/[id]/route";
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

function makeChain(terminalReturn: unknown) {
  const chain: any = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.innerJoin = vi.fn().mockReturnValue(chain);
  chain.set = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockResolvedValue(terminalReturn);
  chain.values = vi.fn().mockResolvedValue(undefined);
  return chain;
}

const MANAGER = { user: { id: "manager-1", email: "mgr@example.com", name: "Manager" } };
const OTHER_MANAGER = { user: { id: "other-manager", email: "other@example.com", name: "Other" } };

const CLASS_BODY = {
  title: "Morning Yoga",
  class_date: "2026-05-01",
  class_time: "09:00",
  max_capacity: 15,
  instructor_uid: "instructor-1",
  organization_uid: "org-1",
};

function postReq(body: object) {
  return new NextRequest("http://localhost/api/classes", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function putReq(body: object) {
  return new NextRequest("http://localhost/api/classes/class-1", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function deleteReq() {
  return new NextRequest("http://localhost/api/classes/class-1", { method: "DELETE" });
}

const routeContext = { params: Promise.resolve({ id: "class-1" }) };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/classes", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await createClass(postReq(CLASS_BODY));

    expect(res.status).toBe(401);
  });

  it("creates a class and returns it when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    const insertChain = makeChain(undefined);
    vi.mocked(db.insert).mockReturnValueOnce(insertChain as any);

    const res = await createClass(postReq(CLASS_BODY));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(json.title).toBe("Morning Yoga");
    expect(json.organization_uid).toBe("org-1");
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Morning Yoga", organization_uid: "org-1" })
    );
  });
});

describe("PUT /api/classes/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await updateClass(putReq(CLASS_BODY), routeContext);

    expect(res.status).toBe(401);
  });

  it("returns 403 when manager does not own the class org", async () => {
    vi.mocked(auth).mockResolvedValue(OTHER_MANAGER as any);
    // verifyClassOwnership returns a row with a different admin_uid
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ admin_uid: "manager-1" }]) as any);

    const res = await updateClass(putReq(CLASS_BODY), routeContext);

    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "Forbidden" });
  });

  it("returns 404 when class does not exist", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);

    const res = await updateClass(putReq(CLASS_BODY), routeContext);

    expect(res.status).toBe(404);
  });

  it("updates the class when manager owns it", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    // verifyClassOwnership: admin_uid matches session user
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ admin_uid: "manager-1" }]) as any);
    const updateChain = makeChain(undefined);
    vi.mocked(db.update).mockReturnValueOnce(updateChain as any);

    const updatedBody = { ...CLASS_BODY, title: "Evening Yoga" };
    const res = await updateClass(putReq(updatedBody), routeContext);

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ title: "Evening Yoga" })
    );
  });
});

describe("DELETE /api/classes/[id]", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await deleteClass(deleteReq(), routeContext);

    expect(res.status).toBe(401);
  });

  it("returns 403 when manager does not own the class org", async () => {
    vi.mocked(auth).mockResolvedValue(OTHER_MANAGER as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ admin_uid: "manager-1" }]) as any);

    const res = await deleteClass(deleteReq(), routeContext);

    expect(res.status).toBe(403);
  });

  it("deletes the class when manager owns it", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ admin_uid: "manager-1" }]) as any);
    const deleteChain = makeChain(undefined);
    vi.mocked(db.delete).mockReturnValueOnce(deleteChain as any);

    const res = await deleteClass(deleteReq(), routeContext);

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(deleteChain.where).toHaveBeenCalled();
  });
});
