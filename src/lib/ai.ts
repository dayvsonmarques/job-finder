interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function callGroq(messages: GroqMessage[], maxTokens = 200): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages,
        max_tokens: maxTokens,
        temperature: 0.3,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) return null;
    const data: GroqResponse = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

export async function summarizeJob(
  title: string,
  company: string,
  description: string
): Promise<string | null> {
  const cleanDesc = stripHtml(description).slice(0, 3000);

  return callGroq([
    {
      role: "system",
      content:
        "Você resume vagas de emprego. " +
        "Gere um resumo conciso em português (máximo 3 frases) incluindo: " +
        "principais responsabilidades, requisitos-chave e benefícios destacados. " +
        "Seja direto e objetivo. Não use markdown.",
    },
    {
      role: "user",
      content: `Vaga: ${title} na empresa ${company}\n\nDescrição:\n${cleanDesc}`,
    },
  ]);
}

export async function enhanceSearchQuery(keywords: string, location: string): Promise<string> {
  const result = await callGroq(
    [
      {
        role: "system",
        content:
          "Você otimiza consultas de busca de emprego focadas no Brasil. " +
          "Dado palavras-chave e localização, gere UMA query de busca otimizada " +
          "em inglês para APIs de emprego. Retorne APENAS a query, sem explicações. " +
          "Inclua termos sinônimos relevantes separados por espaço. " +
          "A localização deve sempre ser no Brasil.",
      },
      {
        role: "user",
        content: `Palavras-chave: ${keywords}\nLocalização: ${location || "Brasil"}`,
      },
    ],
    60
  );

  return result || keywords;
}

export function isGroqConfigured(): boolean {
  return !!process.env.GROQ_API_KEY;
}

export function isRapidApiConfigured(): boolean {
  return !!process.env.RAPIDAPI_KEY;
}

export function isJoobleConfigured(): boolean {
  return !!process.env.JOOBLE_API_KEY;
}

export function isOpenAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
