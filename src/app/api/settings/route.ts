import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DEFAULT_CONFIG_ID } from "@/lib/constants";

export async function GET() {
  const config = await prisma.searchConfig.upsert({
    where: { id: DEFAULT_CONFIG_ID },
    update: {},
    create: { id: DEFAULT_CONFIG_ID },
  });

  return NextResponse.json(config);
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const config = await prisma.searchConfig.upsert({
    where: { id: DEFAULT_CONFIG_ID },
    update: {
      keywords: body.keywords,
      location: body.location,
      intervalHours: body.intervalHours,
      enabledSources: body.enabledSources ?? "",
      isActive: body.isActive,
    },
    create: {
      id: DEFAULT_CONFIG_ID,
      keywords: body.keywords || "",
      location: body.location || "",
      intervalHours: body.intervalHours || 6,
      enabledSources: body.enabledSources ?? "",
      isActive: body.isActive ?? true,
    },
  });

  return NextResponse.json(config);
}
