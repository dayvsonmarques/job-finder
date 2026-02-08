import * as cheerio from "cheerio";
import { JobSearchResult } from "@/types";
import { JOB_SOURCES, SCRAPER_USER_AGENT } from "./constants";

const FETCH_TIMEOUT = 15000;

const SCRAPER_HEADERS = {
  "User-Agent": SCRAPER_USER_AGENT,
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};

async function safeFetch(url: string, headers = SCRAPER_HEADERS): Promise<string | null> {
  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

async function safeFetchJson<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { ...SCRAPER_HEADERS, Accept: "application/json" },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchLinkedInJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const url =
    `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search` +
    `?keywords=${encodeURIComponent(keywords)}` +
    `&location=${encodeURIComponent(location || "Brasil")}` +
    `&start=0&count=25`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: JobSearchResult[] = [];

  $("li").each((_, el) => {
    const title = $(el).find(".base-search-card__title").text().trim();
    const company = $(el).find(".base-search-card__subtitle").text().trim();
    const jobLocation = $(el).find(".job-search-card__location").text().trim();
    const link = $(el).find("a.base-card__full-link").attr("href") || "";
    const dateStr = $(el).find("time").attr("datetime");

    if (!title || !link) return;

    jobs.push({
      title,
      company,
      location: jobLocation || "N/A",
      description: `${title} at ${company} - ${jobLocation}`,
      url: link.split("?")[0],
      source: JOB_SOURCES.LINKEDIN,
      postedAt: dateStr ? new Date(dateStr) : undefined,
      externalId: link.split("/view/")[1]?.split("/")[0] || undefined,
    });
  });

  return jobs;
}

async function fetchCathoJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://www.catho.com.br/vagas/?q=${encodeURIComponent(query)}&page=1`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: JobSearchResult[] = [];

  const scriptTags = $('script[type="application/ld+json"]');
  scriptTags.each((_, el) => {
    try {
      const json = JSON.parse($(el).text());
      const items = json?.itemListElement || (Array.isArray(json) ? json : [json]);

      items.forEach((item: Record<string, unknown>) => {
        const posting = (item?.item || item) as Record<string, unknown>;
        if (posting?.["@type"] !== "JobPosting") return;

        const hiringOrg = posting.hiringOrganization as Record<string, string> | undefined;
        const jobLoc = posting.jobLocation as Record<string, unknown> | undefined;
        const address = jobLoc?.address as Record<string, string> | undefined;

        jobs.push({
          title: String(posting.title || ""),
          company: hiringOrg?.name || "Empresa não informada",
          location: address?.addressLocality || address?.addressRegion || location || "Brasil",
          description: String(posting.description || ""),
          url: String(posting.url || url),
          source: JOB_SOURCES.CATHO,
          postedAt: posting.datePosted ? new Date(String(posting.datePosted)) : undefined,
          externalId: String(posting.identifier || posting.url || ""),
        });
      });
    } catch {
      // skip malformed JSON-LD
    }
  });

  if (jobs.length > 0) return jobs;

  $("[data-testid='job-card'], .job-card, article").each((_, el) => {
    const title = $(el).find("h2, [data-testid='job-title'], .job-card__title").first().text().trim();
    const company = $(el).find("[data-testid='job-company'], .job-card__company").first().text().trim();
    const jobLocation = $(el).find("[data-testid='job-location'], .job-card__location").first().text().trim();
    const link = $(el).find("a").first().attr("href") || "";

    if (!title) return;

    const fullUrl = link.startsWith("http") ? link : `https://www.catho.com.br${link}`;

    jobs.push({
      title,
      company: company || "Empresa não informada",
      location: jobLocation || location || "Brasil",
      description: `${title} - ${company}`,
      url: fullUrl,
      source: JOB_SOURCES.CATHO,
    });
  });

  return jobs;
}

async function fetchGoogleJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = `${keywords} vagas ${location || "Brasil"}`;
  const url =
    `https://www.google.com/search` +
    `?q=${encodeURIComponent(query)}` +
    `&ibp=htl;jobs&hl=pt-BR`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: JobSearchResult[] = [];

  const scriptTags = $("script");
  scriptTags.each((_, el) => {
    const content = $(el).text();
    if (!content.includes("JobPosting")) return;

    try {
      const jsonLdBlocks = content.match(/\{[^]*?"@type"\s*:\s*"JobPosting"[^]*?\}/g);
      jsonLdBlocks?.forEach((block) => {
        const posting = JSON.parse(block);
        jobs.push({
          title: posting.title || "",
          company: posting.hiringOrganization?.name || "",
          location: posting.jobLocation?.address?.addressLocality || location || "Brasil",
          description: posting.description || "",
          url: posting.url || `https://www.google.com/search?q=${encodeURIComponent(query)}&ibp=htl;jobs`,
          source: JOB_SOURCES.GOOGLE,
          postedAt: posting.datePosted ? new Date(posting.datePosted) : undefined,
        });
      });
    } catch {
      // skip parse errors
    }
  });

  if (jobs.length > 0) return jobs;

  $(".BjJfJf, .PwjeAc, .gws-plugins-horizon-jobs__tl-lif").each((_, el) => {
    const title = $(el).find(".BjJfJf, .PwjeAc, .sH3zFd, div[role='heading']").first().text().trim();
    const company = $(el).find(".vNEEBe, .nJlDiv, .wHhUb").first().text().trim();
    const jobLocation = $(el).find(".Qk80Jf, .pwTheOc, .e6m0Sd").first().text().trim();

    if (!title) return;

    jobs.push({
      title,
      company: company || "Empresa não informada",
      location: jobLocation || location || "Brasil",
      description: `${title} - ${company}`,
      url: `https://www.google.com/search?q=${encodeURIComponent(query)}&ibp=htl;jobs`,
      source: JOB_SOURCES.GOOGLE,
    });
  });

  return jobs;
}

interface RemotiveResponse {
  jobs: {
    id: number;
    url: string;
    title: string;
    company_name: string;
    tags: string[];
    publication_date: string;
    candidate_required_location: string;
    salary: string;
    description: string;
  }[];
}

async function fetchRemotiveJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=50`;

  const data = await safeFetchJson<RemotiveResponse>(url);
  if (!data?.jobs) return [];

  return data.jobs.map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.candidate_required_location || "Remote",
    description: job.description || "",
    url: job.url,
    source: JOB_SOURCES.REMOTIVE,
    salary: job.salary || undefined,
    tags: job.tags?.join(", ") || undefined,
    postedAt: job.publication_date ? new Date(job.publication_date) : undefined,
    externalId: String(job.id),
  }));
}

interface ArbeitnowResponse {
  data: {
    slug: string;
    company_name: string;
    title: string;
    description: string;
    tags: string[];
    location: string;
    url: string;
    created_at: number;
  }[];
}

async function fetchArbeitnowJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`;

  const data = await safeFetchJson<ArbeitnowResponse>(url);
  if (!data?.data) return [];

  return data.data.map((job) => ({
    title: job.title,
    company: job.company_name,
    location: job.location || "Remote",
    description: job.description || "",
    url: job.url,
    source: JOB_SOURCES.ARBEITNOW,
    tags: job.tags?.join(", ") || undefined,
    postedAt: job.created_at ? new Date(job.created_at * 1000) : undefined,
    externalId: job.slug,
  }));
}

function matchesLocation(job: JobSearchResult, location: string): boolean {
  if (!location) return true;
  const normalized = location.toLowerCase();
  return (
    job.location.toLowerCase().includes(normalized) ||
    job.title.toLowerCase().includes(normalized) ||
    job.description.toLowerCase().includes(normalized)
  );
}

export async function searchJobs(keywords: string, location: string = ""): Promise<JobSearchResult[]> {
  const results = await Promise.allSettled([
    fetchLinkedInJobs(keywords, location),
    fetchCathoJobs(keywords, location),
    fetchGoogleJobs(keywords, location),
    fetchRemotiveJobs(keywords, location),
    fetchArbeitnowJobs(keywords, location),
  ]);

  const jobs = results
    .filter(
      (r): r is PromiseFulfilledResult<JobSearchResult[]> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value);

  if (!location) return jobs;
  return jobs.filter((job) => matchesLocation(job, location));
}
