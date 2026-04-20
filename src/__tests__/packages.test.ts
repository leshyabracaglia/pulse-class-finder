import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as createPackage, GET as getPackages } from "@/app/api/packages/route";
import { PUT as updatePackage } from "@/app/api/packages/[id]/route";
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

const PACKAGE_BODY = {
  organization_uid: "org-1",
  name: "10-Class Pack",
  description: "Ten classes",
  package_type: "class_pack",
  class_count: 10,
  duration_days: 90,
  price_cents: 10000,
  is_active: true,
};

const EXISTING_PACKAGE = {
  id: "pkg-1",
  ...PACKAGE_BODY,
};

function postReq(body: object) {
  return new NextRequest("http://localhost/api/packages", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

function getReq(org: string) {
  return new NextRequest(`http://localhost/api/packages?organization_uid=${org}`);
}

function putReq(body: object) {
  return new NextRequest("http://localhost/api/packages/pkg-1", {
    method: "PUT",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

const routeContext = { params: Promise.resolve({ id: "pkg-1" }) };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/packages", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await getPackages(getReq("org-1"));

    expect(res.status).toBe(401);
  });

  it("returns packages for the given org when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    vi.mocked(db.select).mockReturnValueOnce(makeChain([EXISTING_PACKAGE]) as any);

    const res = await getPackages(getReq("org-1"));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].name).toBe("10-Class Pack");
  });
});

describe("POST /api/packages", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await createPackage(postReq(PACKAGE_BODY));

    expect(res.status).toBe(401);
  });

  it("creates a package and returns it when authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    const insertChain = makeChain(undefined);
    vi.mocked(db.insert).mockReturnValueOnce(insertChain as any);

    const res = await createPackage(postReq(PACKAGE_BODY));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(json.name).toBe("10-Class Pack");
    expect(json.is_active).toBe(true);
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ name: "10-Class Pack", organization_uid: "org-1" })
    );
  });
});

describe("PUT /api/packages/[id] — deactivate", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await updatePackage(putReq({ ...PACKAGE_BODY, is_active: false }), routeContext);

    expect(res.status).toBe(401);
  });

  it("returns 403 when manager does not own the package org", async () => {
    vi.mocked(auth).mockResolvedValue(OTHER_MANAGER as any);
    // verifyPackageOwnership returns a row whose admin_uid differs from session user
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ admin_uid: "manager-1" }]) as any);

    const res = await updatePackage(putReq({ ...PACKAGE_BODY, is_active: false }), routeContext);

    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "Forbidden" });
  });

  it("deactivates a package when manager owns it", async () => {
    vi.mocked(auth).mockResolvedValue(MANAGER as any);
    // verifyPackageOwnership: admin_uid matches session user
    vi.mocked(db.select).mockReturnValueOnce(makeChain([{ admin_uid: "manager-1" }]) as any);
    const updateChain = makeChain(undefined);
    vi.mocked(db.update).mockReturnValueOnce(updateChain as any);

    const res = await updatePackage(putReq({ ...PACKAGE_BODY, is_active: false }), routeContext);

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ success: true });
    expect(updateChain.set).toHaveBeenCalledWith(
      expect.objectContaining({ is_active: false })
    );
  });
});
