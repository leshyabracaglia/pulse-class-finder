import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { POST as uploadLogo } from "@/app/api/organizations/logo/route";
import { auth } from "@/lib/auth";

vi.mock("@/lib/auth", () => ({ auth: vi.fn() }));

vi.mock("@vercel/blob", () => ({
  put: vi.fn(),
}));

import { put } from "@vercel/blob";

const SESSION = { user: { id: "user-1", email: "mgr@example.com", name: "Manager" } };

// Avoid jsdom FormData/File WebIDL validation by stubbing req.formData() directly.
function makeRequest(file: { type: string; size: number; name: string } | null): NextRequest {
  const formDataStub = { get: (key: string) => (key === "file" ? file : null) };
  return { formData: () => Promise.resolve(formDataStub) } as unknown as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(put).mockResolvedValue({
    url: "https://blob.vercel-storage.com/org-logos/user-1.jpg",
  } as any);
});

describe("POST /api/organizations/logo", () => {
  it("returns 401 when not authenticated", async () => {
    vi.mocked(auth).mockResolvedValue(null as any);

    const res = await uploadLogo(makeRequest({ type: "image/jpeg", size: 100, name: "logo.jpg" }));

    expect(res.status).toBe(401);
    expect(await res.json()).toMatchObject({ error: "Unauthorized" });
  });

  it("returns 400 when no file is provided", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);

    const res = await uploadLogo(makeRequest(null));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: "No file provided" });
  });

  it("returns 400 for a disallowed file type", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);

    const res = await uploadLogo(makeRequest({ type: "application/pdf", size: 100, name: "doc.pdf" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining("Invalid file type") });
  });

  it("returns 400 when file exceeds 1 MB", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);

    const res = await uploadLogo(makeRequest({ type: "image/png", size: 1024 * 1024 + 1, name: "big.png" }));

    expect(res.status).toBe(400);
    expect(await res.json()).toMatchObject({ error: expect.stringContaining("too large") });
  });

  it("uploads the file and returns a blob URL", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);

    const file = { type: "image/png", size: 5000, name: "studio.png" };
    const res = await uploadLogo(makeRequest(file));

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ url: expect.stringContaining("blob.vercel-storage.com") });
    expect(put).toHaveBeenCalledWith(
      "org-logos/user-1.png",
      file,
      expect.objectContaining({ access: "public", contentType: "image/png" })
    );
  });

  it("uses allowOverwrite so repeated uploads replace the previous logo", async () => {
    vi.mocked(auth).mockResolvedValue(SESSION as any);

    await uploadLogo(makeRequest({ type: "image/jpeg", size: 3000, name: "new-logo.jpg" }));

    expect(put).toHaveBeenCalledWith(
      "org-logos/user-1.jpg",
      expect.anything(),
      expect.objectContaining({ allowOverwrite: true })
    );
  });
});
