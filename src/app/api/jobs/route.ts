import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const filter = request.nextUrl.searchParams.get("filter") || "all";

  const where: Record<string, boolean> = {};
  if (filter === "favorite") where.isFavorite = true;
  if (filter === "submitted") where.isSubmitted = true;

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(jobs);
}
