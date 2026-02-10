import { NextResponse } from "next/server";
import { isGroqConfigured, isRapidApiConfigured, isJoobleConfigured } from "@/lib/ai";

export async function GET() {
  return NextResponse.json({
    groq: isGroqConfigured(),
    rapidApi: isRapidApiConfigured(),
    jooble: isJoobleConfigured(),
  });
}
