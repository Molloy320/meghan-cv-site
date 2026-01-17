import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RagItem = {
  id: string;
  source: string;
  chunk_index: number;
  text: string;
  embedding: number[];
};

let cachedIndex: RagItem[] | null = null;

function loadRagIndex(): RagItem[] {
  if (cachedIndex) return cachedIndex;

  const indexPath = path.join(process.cwd(), "data", "rag", "index.json");

  if (!fs.existsSync(indexPath)) {
    throw new Error(
      `RAG index not found at ${indexPath}. Run ingest and commit data/rag/index.json.`
    );
  }

  const raw = fs.readFileSync(indexPath, "utf8");
  const parsed = JSON.parse(raw);

  if (!Array.isArray(parsed)) {
    throw new Error("RAG index.json format invalid. Expected an array.");
  }

  cachedIndex = parsed as RagItem[];
  return cachedIndex;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) return -1;

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? -1 : dot / denom;
}

async function embedQuery(text: string): Promise<number[]> {
  const emb = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });

  const vec = emb.data?.[0]?.embedding;
  if (!vec) throw new Error("Failed to create embedding for query.");
  return vec;
}

function retrieveTopK(index: RagItem[], queryEmbedding: number[], k = 4) {
  const scored = index
    .map((item) => ({
      item,
      score: cosineSimilarity(queryEmbedding, item.embedding),
    }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, k);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = String(body?.message || "").trim();

    if (!userMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    const index = loadRagIndex();
    const queryEmbedding = await embedQuery(userMessage);
    const top = retrieveTopK(index, queryEmbedding, 4);

    const contextBlocks = top
      .filter((t) => t.score > 0) // basic guard
      .map(
        (t, i) =>
          `Source ${i + 1} (score ${t.score.toFixed(3)}, ${t.item.source} chunk ${
            t.item.chunk_index
          }):\n${t.item.text}`
      )
      .join("\n\n---\n\n");

    const systemPrompt = `You are Meghan Molloy’s personal AI assistant on her portfolio website.
Use ONLY the provided context to answer questions about Meghan’s background, skills, experience, education, and personal details.
If the answer is not in the context, say you don’t have that information yet and suggest checking the Resume or About page.
Be clear, warm, professional, and conversational. Keep answers helpful, not verbose.
Important: Meghan is from Virginia. Do not invent other locations.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Context:\n${contextBlocks || "(no context found)"}\n\nQuestion:\n${userMessage}`,
        },
      ],
      temperature: 0.2,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({
      reply,
      debug: {
        used_index_items: top.map((t) => ({
          source: t.item.source,
          chunk_index: t.item.chunk_index,
          score: Number(t.score.toFixed(3)),
        })),
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: String(error?.message || error) },
      { status: 500 }
    );
  }
}
