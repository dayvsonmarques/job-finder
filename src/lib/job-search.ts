import { JobSearchResult } from "@/types";
import { JOB_SOURCES } from "./constants";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  category: string;
  tags: string[];
  job_type: string;
  publication_date: string;
  candidate_required_location: string;
  salary: string;
  description: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  tags: string[];
  job_types: string[];
  location: string;
  remote: boolean;
  url: string;
  created_at: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

function mapRemotiveJob(job: RemotiveJob): JobSearchResult {
  return {
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
  };
}

function mapArbeitnowJob(job: ArbeitnowJob): JobSearchResult {
  return {
    title: job.title,
    company: job.company_name,
    location: job.location || "Remote",
    description: job.description || "",
    url: job.url,
    source: JOB_SOURCES.ARBEITNOW,
    salary: undefined,
    tags: job.tags?.join(", ") || undefined,
    postedAt: job.created_at ? new Date(job.created_at * 1000) : undefined,
    externalId: job.slug,
  };
}

async function fetchRemotiveJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=50`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

  if (!response.ok) return [];

  const data: RemotiveResponse = await response.json();
  return (data.jobs || []).map(mapRemotiveJob);
}

async function fetchArbeitnowJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const query = [keywords, location].filter(Boolean).join(" ");
  const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(query)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });

  if (!response.ok) return [];

  const data: ArbeitnowResponse = await response.json();
  return (data.data || []).map(mapArbeitnowJob);
}

function matchesLocation(job: JobSearchResult, location: string): boolean {
  if (!location) return true;
  const normalizedLocation = location.toLowerCase();
  return (
    job.location.toLowerCase().includes(normalizedLocation) ||
    job.title.toLowerCase().includes(normalizedLocation) ||
    job.description.toLowerCase().includes(normalizedLocation)
  );
}

export async function searchJobs(keywords: string, location: string = ""): Promise<JobSearchResult[]> {
  const results = await Promise.allSettled([
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
