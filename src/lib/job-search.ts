import * as cheerio from "cheerio";
import { JobSearchResult } from "@/types";
import { JOB_SOURCES, JobSourceKey } from "./constants";

const FETCH_TIMEOUT = 15000;

const SCRAPER_USER_AGENT =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

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

function parseJsonLdJobPostings($: cheerio.CheerioAPI, source: string, fallbackLocation: string): JobSearchResult[] {
  const jobs: JobSearchResult[] = [];
  $('script[type="application/ld+json"]').each((_, el) => {
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
          location: address?.addressLocality || address?.addressRegion || fallbackLocation,
          description: String(posting.description || ""),
          url: String(posting.url || ""),
          source,
          postedAt: posting.datePosted ? new Date(String(posting.datePosted)) : undefined,
          externalId: String(posting.identifier || posting.url || ""),
        });
      });
    } catch {
      // skip malformed JSON-LD
    }
  });
  return jobs;
}

// ─── LinkedIn ────────────────────────────────────────────────────────────────

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

// ─── Catho ───────────────────────────────────────────────────────────────────

async function fetchCathoJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://www.catho.com.br/vagas/?q=${encodeURIComponent(query)}&page=1`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);

  const jsonLdJobs = parseJsonLdJobPostings($, JOB_SOURCES.CATHO, location || "Brasil");
  if (jsonLdJobs.length > 0) return jsonLdJobs;

  const jobs: JobSearchResult[] = [];
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

// ─── Google Jobs ─────────────────────────────────────────────────────────────

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

  $("script").each((_, el) => {
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

// ─── Glassdoor ───────────────────────────────────────────────────────────────

async function fetchGlassdoorJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://www.glassdoor.com.br/Vaga/brasil-${encodeURIComponent(query)}-vagas-SRCH_IL.0,6_IN36_KO7,${7 + query.length}.htm`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: JobSearchResult[] = [];

  const jsonLdJobs = parseJsonLdJobPostings($, JOB_SOURCES.GLASSDOOR, location || "Brasil");
  if (jsonLdJobs.length > 0) return jsonLdJobs;

  $("[data-test='jobListing'], .JobsList_jobListItem__JBBUQ, li.react-job-listing").each((_, el) => {
    const title = $(el).find("[data-test='job-title'], .jobTitle, .job-title").first().text().trim();
    const company = $(el).find("[data-test='emp-name'], .EmployerProfile_compactEmployerName__LE242, .job-search-key-l2wjgv").first().text().trim();
    const jobLocation = $(el).find("[data-test='emp-location'], .compactEmployerLocation, .job-search-key-1p4ilu3").first().text().trim();
    const link = $(el).find("a[data-test='job-title'], a.jobTitle, a").first().attr("href") || "";

    if (!title) return;

    const fullUrl = link.startsWith("http") ? link : `https://www.glassdoor.com.br${link}`;
    jobs.push({
      title,
      company: company || "Empresa não informada",
      location: jobLocation || location || "Brasil",
      description: `${title} - ${company}`,
      url: fullUrl.split("?")[0],
      source: JOB_SOURCES.GLASSDOOR,
    });
  });

  return jobs;
}

// ─── ProgramaThor ────────────────────────────────────────────────────────────

async function fetchProgramaThorJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://programathor.com.br/jobs?search=${encodeURIComponent(query)}`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: JobSearchResult[] = [];

  $(".cell-list__item, .card-job, .job-card, article").each((_, el) => {
    const title = $(el).find("h3, .cell-list__item-title, .card-job__title, .job-card__title").first().text().trim();
    const company = $(el).find(".cell-list__item-company, .card-job__company, .job-card__company, span").first().text().trim();
    const jobLocation = $(el).find(".cell-list__item-local, .card-job__location").first().text().trim();
    const link = $(el).find("a").first().attr("href") || "";
    const salary = $(el).find(".cell-list__item-salary, .card-job__salary").first().text().trim();

    if (!title) return;

    const fullUrl = link.startsWith("http") ? link : `https://programathor.com.br${link}`;
    jobs.push({
      title,
      company: company || "Empresa não informada",
      location: jobLocation || location || "Brasil",
      description: `${title} - ${company}`,
      url: fullUrl,
      source: JOB_SOURCES.PROGRAMATHOR,
      salary: salary || undefined,
    });
  });

  return jobs;
}

// ─── 99Freelas ───────────────────────────────────────────────────────────────

async function fetch99FreelasJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://www.99freelas.com.br/projects?search=${encodeURIComponent(query)}`;

  const html = await safeFetch(url);
  if (!html) return [];

  const $ = cheerio.load(html);
  const jobs: JobSearchResult[] = [];

  $(".result-container, .project-list__item, .project-item, article, li.result").each((_, el) => {
    const title = $(el).find("h1 a, h2 a, .result-container__title a, .project-name a").first().text().trim();
    const description = $(el).find(".result-container__description, .project-description, p").first().text().trim();
    const link = $(el).find("h1 a, h2 a, .result-container__title a, .project-name a").first().attr("href") || "";
    const budget = $(el).find(".result-container__budget, .project-budget, .budget").first().text().trim();
    const tags = $(el).find(".result-container__skills a, .skill-tag, .tag").map((_, t) => $(t).text().trim()).get();

    if (!title) return;

    const fullUrl = link.startsWith("http") ? link : `https://www.99freelas.com.br${link}`;
    jobs.push({
      title,
      company: "99Freelas (Freelance)",
      location: location || "Remoto",
      description: description || title,
      url: fullUrl,
      source: JOB_SOURCES.FREELAS99,
      salary: budget || undefined,
      tags: tags.length > 0 ? tags.join(", ") : undefined,
    });
  });

  return jobs;
}

// ─── Remotive (API) ──────────────────────────────────────────────────────────

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
  const data = await safeFetchJson<RemotiveResponse>(
    `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=50`
  );
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

// ─── Arbeitnow (API) ────────────────────────────────────────────────────────

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
  const data = await safeFetchJson<ArbeitnowResponse>(
    `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`
  );
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

// ─── Orchestrator ────────────────────────────────────────────────────────────

type FetcherFn = (keywords: string, location: string) => Promise<JobSearchResult[]>;

const SOURCE_FETCHERS: Record<JobSourceKey, FetcherFn> = {
  LINKEDIN: fetchLinkedInJobs,
  CATHO: fetchCathoJobs,
  GOOGLE: fetchGoogleJobs,
  GLASSDOOR: fetchGlassdoorJobs,
  PROGRAMATHOR: fetchProgramaThorJobs,
  FREELAS99: fetch99FreelasJobs,
  REMOTIVE: fetchRemotiveJobs,
  ARBEITNOW: fetchArbeitnowJobs,
};

function matchesLocation(job: JobSearchResult, location: string): boolean {
  if (!location) return true;
  const normalized = location.toLowerCase();
  return (
    job.location.toLowerCase().includes(normalized) ||
    job.title.toLowerCase().includes(normalized) ||
    job.description.toLowerCase().includes(normalized)
  );
}

export async function searchJobs(
  keywords: string,
  location: string = "",
  enabledSources: string[] = []
): Promise<JobSearchResult[]> {
  const entries = Object.entries(SOURCE_FETCHERS) as [JobSourceKey, FetcherFn][];

  const fetchers = enabledSources.length > 0
    ? entries.filter(([key]) => enabledSources.includes(key))
    : entries;

  const results = await Promise.allSettled(
    fetchers.map(([, fn]) => fn(keywords, location))
  );

  const jobs = results
    .filter(
      (r): r is PromiseFulfilledResult<JobSearchResult[]> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value);

  if (!location) return jobs;
  return jobs.filter((job) => matchesLocation(job, location));
}
