import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---- RAG file locations (committed to your repo) ----
const INDEX_PATH = path.join(process.cwd(), "data", "rag", "index.json");
const VECTORS_PATH = path.join(process.cwd(), "data", "rag", "vectors.json");

// Cache in memory for performance (Vercel may reuse)
let cachedIndex: Array<{
  id: string;
  source: string;
  chunk_index: number;
  text: string;
}> | null = null;

let cachedVectors: number[][] | null = null;

function loadRagFiles() {
  if (!cachedIndex) {
    const raw = fs.readFileSync(INDEX_PATH, "utf8");
    cachedIndex = JSON.parse(raw);
  }

  if (!cachedVectors) {
    const raw = fs.readFileSync(VECTORS_PATH, "utf8");
    cachedVectors = JSON.parse(raw);
  }

  if (!cachedIndex || !cachedVectors) {
    throw new Error("RAG cache failed to initialize.");
  }

  if (cachedIndex.length !== cachedVectors.length) {
    throw new Error(
      `RAG mismatch: index has ${cachedIndex.length} items but vectors has ${cachedVectors.length}. Re-run ingest-local.js.`
    );
  }

  return { index: cachedIndex, vectors: cachedVectors };
}

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    na += x * x;
    nb += y * y;
  }

  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function topKSimilar(
  queryVec: number[],
  vectors: number[][],
  k: number
): Array<{ i: number; score: number }> {
  const scores: Array<{ i: number; score: number }> = [];

  for (let i = 0; i < vectors.length; i++) {
    const score = cosineSimilarity(queryVec, vectors[i]);
    scores.push({ i, score });
  }

  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, k);
}

function buildContext(chunks: Array<{ text: string; source: string; chunk_index: number }>) {
  // Keep it compact + readable for the model
  const lines: string[] = [];
  for (const c of chunks) {
    lines.push(
      `SOURCE: ${c.source} (chunk ${c.chunk_index})\n` +
        `CONTENT:\n${c.text}\n`
    );
  }
  return lines.join("\n---\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const userMessage = body?.message?.trim();

    if (!userMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // Make sure the RAG files exist in the deployed build
    if (!fs.existsSync(INDEX_PATH) || !fs.existsSync(VECTORS_PATH)) {
      return NextResponse.json(
        {
          error:
            "RAG files missing on server. Ensure data/rag/index.json and data/rag/vectors.json exist, are valid JSON, committed, and deployed.",
        },
        { status: 500 }
      );
    }

    const { index, vectors } = loadRagFiles();

    // 1) Embed the question
    const embedRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userMessage,
    });

    const qVec = embedRes.data?.[0]?.embedding;
    if (!qVec) {
      return NextResponse.json(
        { error: "Failed to create embedding for the question." },
        { status: 500 }
      );
    }

    // 2) Retrieve top chunks
    const TOP_K = 6;
    const results = topKSimilar(qVec, vectors, TOP_K);

    const retrieved = results
      .map((r) => ({
        score: r.score,
        ...index[r.i],
      }))
      // Optional threshold to reduce nonsense
      .filter((x) => x.score >= 0.2);

    const context = buildContext(retrieved);

    // 3) Answer using context (RAG)
    const system = `
You are Meghan Molloy’s personal AI assistant on her portfolio website.

Rules:
- Use ONLY the provided SOURCE context to answer factual questions about Meghan (bio, background, location, experience, skills, education, projects).
- If the context does not contain the answer, say you don't have that information yet and suggest what to add to the PDF.
- Be clear, warm, professional, and conversational. Keep answers helpful but not verbose.
- Do not guess or invent locations, job history, credentials, or personal details.
`;

    const user = `
QUESTION:
${userMessage}

SOURCE CONTEXT:
${context || "[No relevant context retrieved]"}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system.trim() },
        { role: "user", content: user.trim() },
      ],
    });

    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "Sorry, I could not generate a response.";

    return NextResponse.json({
      reply,
      // Optional: helps you debug retrieval in the UI/logs
      debug: {
        retrieved_count: retrieved.length,
        retrieved: retrieved.map((r) => ({
          score: Number(r.score.toFixed(3)),
          source: r.source,
          chunk_index: r.chunk_index,
        })),
      },
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
