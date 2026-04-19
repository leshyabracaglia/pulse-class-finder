import { NextResponse } from "next/server";
import { generateNonce } from "siwe";

export async function GET() {
  return NextResponse.json({ nonce: generateNonce() });
}
