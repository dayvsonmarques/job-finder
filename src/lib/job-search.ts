import { JobSearchResult } from "@/types";
import { JOB_SOURCES, JobSourceKey } from "./constants";

const FETCH_TIMEOUT = 15000;

async function safeFetchJson<T>(url: string, headers: Record<string, string> = {}): Promise<T | null> {
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json", ...headers },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

interface JSearchResponse {
  data: {
    job_id: string;
    employer_name: string;
    job_title: string;
    job_description: string;
    job_apply_link: string;
    job_city: string;
    job_state: string;
    job_country: string;
    job_posted_at_datetime_utc: string;
    job_min_salary: number | null;
    job_max_salary: number | null;
    job_salary_currency: string | null;
    job_required_skills: string[] | null;
  }[];
}

async function fetchJSearchJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) return [];

  const query = [keywords, location].filter(Boolean).join(" in ");
  const params = new URLSearchParams({
    query,
    page: "1",
    num_pages: "2",
    date_posted: "month",
    remote_jobs_only: "false",
  });

  const data = await safeFetchJson<JSearchResponse>(
    `https://jsearch.p.rapidapi.com/search?${params}`,
    {
      "X-RapidAPI-Key": apiKey,
      "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
  );

  if (!data?.data) return [];

  return data.data.map((job) => {
    const salary = formatSalary(job.job_min_salary, job.job_max_salary, job.job_salary_currency);
    const loc = [job.job_city, job.job_state, job.job_country].filter(Boolean).join(", ");

    return {
      title: job.job_title,
      company: job.employer_name || "Empresa não informada",
      location: loc || "N/A",
      description: job.job_description || "",
      url: job.job_apply_link,
      source: JOB_SOURCES.JSEARCH,
      salary: salary || undefined,
      tags: job.job_required_skills?.join(", ") || undefined,
      postedAt: job.job_posted_at_datetime_utc ? new Date(job.job_posted_at_datetime_utc) : undefined,
      externalId: job.job_id,
    };
  });
}

function formatSalary(min: number | null, max: number | null, currency: string | null): string | null {
  if (!min && !max) return null;
  const cur = currency || "USD";
  if (min && max) return `${cur} ${min.toLocaleString()} - ${max.toLocaleString()}`;
  if (min) return `${cur} ${min.toLocaleString()}+`;
  return `até ${cur} ${max!.toLocaleString()}`;
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

type FetcherFn = (keywords: string, location: string) => Promise<JobSearchResult[]>;

const SOURCE_FETCHERS: Record<JobSourceKey, FetcherFn> = {
  JSEARCH: fetchJSearchJobs,
  REMOTIVE: fetchRemotiveJobs,
  ARBEITNOW: fetchArbeitnowJobs,
};

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

  return results
    .filter(
      (r): r is PromiseFulfilledResult<JobSearchResult[]> =>
        r.status === "fulfilled"
    )
    .flatMap((r) => r.value);
}
