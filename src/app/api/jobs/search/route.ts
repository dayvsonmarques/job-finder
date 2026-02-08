import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchJobs } from "@/lib/job-search";
import { DEFAULT_CONFIG_ID } from "@/lib/constants";

export async function POST() {
  const config = await prisma.searchConfig.upsert({
    where: { id: DEFAULT_CONFIG_ID },
    update: {},
    create: { id: DEFAULT_CONFIG_ID },
  });

  if (!config.keywords) {
    return NextResponse.json(
      { error: "No search keywords configured" },
      { status: 400 }
    );
  }

  const enabledSources = config.enabledSources
    ? config.enabledSources.split(",")
    : [];

  const results = await searchJobs(config.keywords, config.location, enabledSources);

  let savedCount = 0;
  for (const job of results) {
    try {
      await prisma.job.upsert({
        where: { url: job.url },
        update: {
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          source: job.source,
          salary: job.salary || null,
          tags: job.tags || null,
          postedAt: job.postedAt || null,
        },
        create: {
          externalId: job.externalId || null,
          title: job.title,
          company: job.company,
          location: job.location,
          description: job.description,
          url: job.url,
          source: job.source,
          salary: job.salary || null,
          tags: job.tags || null,
          postedAt: job.postedAt || null,
        },
      });
      savedCount++;
    } catch {
      continue;
    }
  }

  await prisma.searchConfig.update({
    where: { id: DEFAULT_CONFIG_ID },
    data: { lastSearchAt: new Date() },
  });

  return NextResponse.json({ found: results.length, saved: savedCount });
}
