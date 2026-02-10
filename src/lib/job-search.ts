import { JobSearchResult } from "@/types";
import { JOB_SOURCES, JobSourceKey } from "./constants";

const FETCH_TIMEOUT = 15000;

async function safeFetchJson<T>(url: string, options: RequestInit = {}): Promise<T | null> {
  try {
    const { headers: optHeaders, ...restOptions } = options;
    const mergedHeaders: Record<string, string> = {
      Accept: "application/json",
      ...(optHeaders as Record<string, string> || {}),
    };
    const response = await fetch(url, {
      headers: mergedHeaders,
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
      ...restOptions,
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

  const loc = location || "Brasil";
  const query = `${keywords} in ${loc}`;
  const params = new URLSearchParams({
    query,
    page: "1",
    num_pages: "2",
    date_posted: "month",
    remote_jobs_only: "false",
    country: "BR",
  });

  const data = await safeFetchJson<JSearchResponse>(
    `https://jsearch.p.rapidapi.com/search?${params}`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
      },
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
  const cur = currency || "BRL";
  if (min && max) return `${cur} ${min.toLocaleString("pt-BR")} - ${max.toLocaleString("pt-BR")}`;
  if (min) return `${cur} ${min.toLocaleString("pt-BR")}+`;
  return `até ${cur} ${max!.toLocaleString("pt-BR")}`;
}

interface JoobleResponse {
  jobs: {
    title: string;
    location: string;
    snippet: string;
    salary: string;
    source: string;
    type: string;
    link: string;
    company: string;
    updated: string;
    id: number;
  }[];
}

const BRAZIL_LOCATION = /brazil|brasil|são paulo|rio de janeiro|belo horizonte|curitiba|porto alegre|brasília|recife|fortaleza|salvador|campinas|florianópolis|goiânia|manaus|belém|remote|remoto|anywhere|worldwide|global|latam|latin america|south america/i;

function cleanKeywords(keywords: string): string {
  return keywords
    .replace(/\b(remoto|remote|brasil|brazil)\b/gi, "")
    .replace(/,\s*,/g, ",")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
}

const PT_TO_EN: Record<string, string> = {
  desenvolvedor: "developer",
  programador: "programmer",
  engenheiro: "engineer",
  analista: "analyst",
  arquiteto: "architect",
  sênior: "senior",
  pleno: "mid-level",
  júnior: "junior",
  estagiário: "intern",
  estágio: "internship",
  vaga: "",
  vagas: "",
};

function translateKeywords(keywords: string): string {
  let translated = keywords.toLowerCase();
  for (const [pt, en] of Object.entries(PT_TO_EN)) {
    translated = translated.replace(new RegExp(`\\b${pt}\\b`, "gi"), en);
  }
  return translated.replace(/\s+/g, " ").trim();
}

async function fetchJoobleJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const apiKey = process.env.JOOBLE_API_KEY;
  if (!apiKey) return [];

  const joobleLocation = location
    .replace(/brasil/gi, "Brazil")
    .replace(/,?\s*remote\s*/gi, "")
    .trim() || "Brazil";

  const cleanedKeywords = cleanKeywords(keywords);
  const englishKeywords = translateKeywords(cleanedKeywords);

  const queries = [cleanedKeywords];
  if (englishKeywords !== cleanedKeywords.toLowerCase()) {
    queries.push(englishKeywords);
  }

  const allJobs: JoobleResponse["jobs"] = [];

  for (const q of queries) {
    for (const page of [1, 2]) {
      const data = await safeFetchJson<JoobleResponse>(
        `https://jooble.org/api/${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keywords: q,
            location: joobleLocation,
            page,
          }),
        }
      );
      if (data?.jobs?.length) {
        allJobs.push(...data.jobs);
      }
    }
  }

  if (allJobs.length === 0) return [];

  const seen = new Set<number>();

  return allJobs
    .filter((job) => {
      if (seen.has(job.id)) return false;
      seen.add(job.id);
      return BRAZIL_LOCATION.test(job.location || "");
    })
    .map((job) => ({
      title: job.title,
      company: job.company || "Empresa não informada",
      location: job.location || "Brasil",
      description: job.snippet || "",
      url: job.link,
      source: JOB_SOURCES.JOOBLE,
      salary: job.salary || undefined,
      tags: job.type || undefined,
      postedAt: job.updated ? new Date(job.updated) : undefined,
    externalId: String(job.id),
  }));
}

interface OpenAIResponseItem {
  type: string;
  content?: { type: string; text?: string }[];
}

interface OpenAIResponseBody {
  output: OpenAIResponseItem[];
}

interface OpenAIJobResult {
  title?: string;
  company?: string;
  location?: string;
  description?: string;
  url?: string;
  salary?: string | null;
  tags?: string | null;
  postedAt?: string | null;
}

async function fetchOpenAIJobs(keywords: string, location: string): Promise<JobSearchResult[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];

  const loc = location || "Brasil";

  const prompt =
    `Busque vagas de emprego REAIS publicadas recentemente (últimos 30 dias) com os seguintes critérios:\n` +
    `- Palavras-chave: ${keywords}\n` +
    `- Localização: ${loc} (apenas vagas para atuação no Brasil — presencial, híbrido ou remoto baseado no Brasil)\n\n` +
    `Busque em sites como LinkedIn, Indeed, Glassdoor, Gupy, Catho, Vagas.com, Programathor, GeekHunter, Remotar, Trampos.co e outros.\n\n` +
    `Retorne APENAS um JSON array válido com objetos contendo estes campos:\n` +
    `- "title": título da vaga\n` +
    `- "company": nome da empresa\n` +
    `- "location": cidade/estado ou "Remoto - Brasil"\n` +
    `- "description": descrição breve (2-3 frases sobre a vaga)\n` +
    `- "url": link direto para a vaga (URL completa e real)\n` +
    `- "salary": informação salarial se disponível, ou null\n` +
    `- "tags": tecnologias/skills separadas por vírgula\n` +
    `- "postedAt": data de publicação ISO 8601 ou null\n\n` +
    `Retorne pelo menos 15 vagas reais e atuais se disponíveis. ` +
    `APENAS o JSON array, sem texto adicional, sem markdown, sem code blocks.`;

  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!res.ok) return [];

    const data: OpenAIResponseBody = await res.json();

    const messageOutput = data.output?.find((o) => o.type === "message");
    const textContent = messageOutput?.content?.find((c) => c.type === "output_text");
    const text = textContent?.text;

    if (!text) return [];

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    let jobs: OpenAIJobResult[];
    try {
      jobs = JSON.parse(jsonMatch[0]);
    } catch {
      return [];
    }

    if (!Array.isArray(jobs)) return [];

    return jobs
      .filter((job) => job.title && job.url)
      .map((job) => ({
        title: job.title || "",
        company: job.company || "Empresa não informada",
        location: job.location || "Brasil",
        description: job.description || "",
        url: job.url || "",
        source: JOB_SOURCES.OPENAI,
        salary: job.salary || undefined,
        tags: job.tags || undefined,
        postedAt: job.postedAt ? new Date(job.postedAt) : undefined,
        externalId: undefined,
      }));
  } catch {
    return [];
  }
}

type FetcherFn = (keywords: string, location: string) => Promise<JobSearchResult[]>;

const SOURCE_FETCHERS: Record<JobSourceKey, FetcherFn> = {
  OPENAI: fetchOpenAIJobs,
  JSEARCH: fetchJSearchJobs,
  JOOBLE: fetchJoobleJobs,
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
