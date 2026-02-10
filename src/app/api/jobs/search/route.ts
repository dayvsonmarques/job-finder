import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { searchJobs } from "@/lib/job-search";
import { DEFAULT_CONFIG_ID } from "@/lib/constants";
import { summarizeJob, enhanceSearchQuery, isGroqConfigured } from "@/lib/ai";

const AI_SUMMARY_BATCH_SIZE = 10;

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

  const location = config.location || "Brasil";
  const enhancedQuery = await enhanceSearchQuery(config.keywords, location);
  const results = await searchJobs(enhancedQuery, location, enabledSources);

  const newJobIds: string[] = [];
  let savedCount = 0;

  for (const job of results) {
    try {
      const existing = await prisma.job.findUnique({ where: { url: job.url } });

      if (existing) {
        await prisma.job.update({
          where: { url: job.url },
          data: {
            title: job.title,
            company: job.company,
            location: job.location,
            description: job.description,
            source: job.source,
            salary: job.salary || null,
            tags: job.tags || null,
            postedAt: job.postedAt || null,
          },
        });
        savedCount++;
      } else {
        const created = await prisma.job.create({
          data: {
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
        newJobIds.push(created.id);
        savedCount++;
      }
    } catch {
      continue;
    }
  }

  if (isGroqConfigured() && newJobIds.length > 0) {
    const toSummarize: { id: string; title: string; company: string; description: string }[] = await prisma.job.findMany({
      where: { id: { in: newJobIds.slice(0, AI_SUMMARY_BATCH_SIZE) } },
      select: { id: true, title: true, company: true, description: true },
    });

    const summaryResults = await Promise.allSettled(
      toSummarize.map(async (job: { id: string; title: string; company: string; description: string }) => {
        const summary = await summarizeJob(job.title, job.company, job.description);
        if (summary) {
          await prisma.job.update({
            where: { id: job.id },
            data: { aiSummary: summary },
          });
        }
      })
    );

    const summarized = summaryResults.filter((r) => r.status === "fulfilled").length;
    await prisma.searchConfig.update({
      where: { id: DEFAULT_CONFIG_ID },
      data: { lastSearchAt: new Date() },
    });

    return NextResponse.json({
      found: results.length,
      saved: savedCount,
      aiSummarized: summarized,
      aiEnhanced: enhancedQuery !== config.keywords,
    });
  }

  await prisma.searchConfig.update({
    where: { id: DEFAULT_CONFIG_ID },
    data: { lastSearchAt: new Date() },
  });

  return NextResponse.json({
    found: results.length,
    saved: savedCount,
    aiSummarized: 0,
    aiEnhanced: false,
  });
}
