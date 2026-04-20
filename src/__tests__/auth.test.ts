import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as register } from "@/app/api/register/route";
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

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed-password"),
    compare: vi.fn().mockResolvedValue(true),
  },
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

vi.mock("@/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => children,
}));

function makeChain(terminalReturn: unknown) {
  const chain: any = {};
  chain.from = vi.fn().mockReturnValue(chain);
  chain.innerJoin = vi.fn().mockReturnValue(chain);
  chain.set = vi.fn().mockReturnValue(chain);
  chain.where = vi.fn().mockResolvedValue(terminalReturn);
  chain.values = vi.fn().mockResolvedValue(undefined);
  return chain;
}

function postReq(body: object) {
  return new NextRequest("http://localhost/api/register", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/register", () => {
  it("returns 400 when email or password is missing", async () => {
    const res = await register(postReq({ email: "test@example.com" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "Missing fields" });
  });

  it("returns 409 when email is already registered", async () => {
    vi.mocked(db.select).mockReturnValueOnce(
      makeChain([{ id: "existing-user", email: "taken@example.com" }]) as any
    );

    const res = await register(postReq({ email: "taken@example.com", password: "pass123" }));

    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: "Email already registered" });
  });

  it("creates a profile and returns id + email for a new user", async () => {
    // No existing user found
    vi.mocked(db.select).mockReturnValueOnce(makeChain([]) as any);
    const insertChain = makeChain(undefined);
    vi.mocked(db.insert).mockReturnValueOnce(insertChain as any);

    const res = await register(postReq({ email: "new@example.com", password: "pass123", fullName: "New User" }));

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBeDefined();
    expect(json.email).toBe("new@example.com");
    expect(insertChain.values).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com", full_name: "New User" })
    );
  });
});

describe("ProtectedLayout — unauthenticated redirect", () => {
  it("redirects to /login when there is no session", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    // Dynamic import avoids issues with top-level RSC evaluation
    const { default: ProtectedLayout } = await import("@/app/(protected)/layout");
    const { redirect } = await import("next/navigation");

    await expect(ProtectedLayout({ children: null })).rejects.toThrow("REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
