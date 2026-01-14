// NOTE: sources removed from responses
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type VectorRow = {
  id: string;
  source: string;
  chunkIndex: number;
  content: string;
  embedding: number[];
};

let cachedVectors: VectorRow[] | null = null;

function loadVectors(): VectorRow[] {
  if (cachedVectors) return cachedVectors;

  const filePath = path.join(process.cwd(), "data", "vectors.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(raw);

  cachedVectors = json.vectors as VectorRow[];
  return cachedVectors;
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let aMag = 0;
  let bMag = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    aMag += a[i] * a[i];
    bMag += b[i] * b[i];
  }

  return dot / (Math.sqrt(aMag) * Math.sqrt(bMag));
}

async function embedQuery(text: string, apiKey: string) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Query embedding error: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding as number[];
}

async function generateAnswer(prompt: string, apiKey: string) {
  const r = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
  {
    role: "system",
    content: `You are Meghan Molloy’s personal AI assistant on her portfolio website.

Your job is to answer questions about Meghan in a friendly, natural, and professional way, as if you know her background well.

Use the provided background information to answer accurately, but:
- Do NOT mention documents, resumes, files, sources, chunks, or citations.
- Do NOT say phrases like "according to the resume" or "based on the document".
- Do NOT invent facts or fill in gaps.

If a question goes beyond Meghan’s experience or personal details she has chosen to share, respond politely and briefly that you don’t have that information.

Keep answers clear, warm, and conversational — helpful but not verbose.`,
  },
  {
    role: "user",
    content: prompt,
  },
],

    }),
  });

  if (!r.ok) {
    const err = await r.text();
    throw new Error(`Chat error: ${err}`);
  }

  const data = await r.json();
  return (
    data.output_text ||
    data.output?.[0]?.content?.[0]?.text ||
    "No response."
  ) as string;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Missing OPENAI_API_KEY" }, { status: 500 });
    }

    // 1) Load vectors from data/vectors.json
    const vectors = loadVectors();

    // 2) Embed the question
    const qEmbedding = await embedQuery(message, apiKey);

    // 3) Retrieve top matches
    const topK = 6;
    const scored = vectors
      .map((v) => ({ v, score: cosineSimilarity(qEmbedding, v.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const context = scored
      .map(
        (x, i) =>
          `SOURCE ${i + 1} (${x.v.source}, chunk ${x.v.chunkIndex}):\n${x.v.content}`
      )
      .join("\n\n---\n\n");

    // 4) Build a strict RAG prompt
    const prompt = `
SOURCES:
${context}

QUESTION:
${message}

Answer using ONLY the SOURCES above.
`;

    // 5) Generate
    const reply = await generateAnswer(prompt, apiKey);

    return NextResponse.json({
      reply,
      // Helpful for debugging (optional)
      debugTopSources: scored.map((s, i) => ({
        rank: i + 1,
        source: s.v.source,
        chunkIndex: s.v.chunkIndex,
        score: Number(s.score.toFixed(4)),
      })),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Unknown error" }, { status: 500 });
  }
}
