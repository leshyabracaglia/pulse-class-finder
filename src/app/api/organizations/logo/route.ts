import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 1024 * 1024; // 1 MB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type. Use JPG, PNG, GIF, or WebP." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Maximum size is 1 MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const blob = await put(`org-logos/${session.user.id}.${ext}`, file, {
    access: "public",
    contentType: file.type,
    allowOverwrite: true,
  });

  return NextResponse.json({ url: blob.url });
}
