import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  const { id } = await request.json();

  const job = await prisma.job.findUnique({ where: { id } });
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const updated = await prisma.job.update({
    where: { id },
    data: {
      isFavorite: !job.isFavorite,
      favoritedAt: !job.isFavorite ? new Date() : null,
    },
  });

  return NextResponse.json(updated);
}
