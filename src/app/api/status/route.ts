import { NextResponse } from "next/server";
import { isGroqConfigured, isRapidApiConfigured } from "@/lib/ai";

export async function GET() {
  return NextResponse.json({
    groq: isGroqConfigured(),
    rapidApi: isRapidApiConfigured(),
  });
}
