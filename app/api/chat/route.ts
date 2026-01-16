import { NextResponse } from "next/server";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RagItem = {
  id: string;
  sourceId: string;
  title?: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  meta?: {
    authority?: string;
    topic?: string;
  };
};

function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i];
    const y = b[i];
    dot += x * y;
    normA += x * x;
    normB += y * y;
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function loadRagIndex(): RagItem[] {
  const indexPath = path.join(process.cwd(), "data", "rag", "index.json");
  if (!fs.existsSync(indexPath)) return [];

  const raw = fs.readFileSync(indexPath, "utf8");
  const parsed = JSON.parse(raw);

  return Array.isArray(parsed) ? (parsed as RagItem[]) : [];
}

function buildContext(snippets: RagItem[]) {
  // Keep context tight and readable
  return snippets
    .map((s) => {
      const labelParts = [
        s.title || s.sourceId || "source",
        typeof s.chunkIndex === "number" ? `chunk ${s.chunkIndex}` : null,
      ].filter(Boolean);

      const label = labelParts.join(" — ");
      return `[${label}]\n${s.text}`;
    })
    .join("\n\n");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = String(body?.message || "").trim();

    if (!userMessage) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    // 1) Load RAG index
    const ragIndex = loadRagIndex();

    // 2) Embed the user query
    const q = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userMessage,
    });

    const queryEmbedding = q.data?.[0]?.embedding;
    if (!queryEmbedding) {
      return NextResponse.json({ error: "Embedding failed" }, { status: 500 });
    }

    // 3) Score and rank chunks
    const scored = ragIndex
      .map((item) => ({
        item,
        score: cosineSimilarity(queryEmbedding, item.embedding || []),
      }))
      .sort((a, b) => b.score - a.score);

    // 4) Prefer authoritative biographical chunks when relevant
    // If question looks biographical, boost those chunks slightly
    const bioish =
      /where.*from|born|raised|hometown|live|living|background|about|bio|family/i.test(
        userMessage
      );

    let top = scored.slice(0, 12);

    if (bioish) {
      // Re-rank with a small bonus for "primary" or "biographical"
      top = scored
        .map(({ item, score }) => {
          const authorityBonus =
            item?.meta?.authority === "primary" ? 0.05 : 0;
          const topicBonus = item?.meta?.topic === "biographical" ? 0.05 : 0;
          return { item, score: score + authorityBonus + topicBonus };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 12);
    }

    // Filter weak matches so we don't feed irrelevant context
    const MIN_SCORE = 0.20;
    const topMatches = top
      .filter((x) => x.score >= MIN_SCORE)
      .slice(0, 6)
      .map((x) => x.item);

    const context = topMatches.length ? buildContext(topMatches) : "";

    // 5) Generate answer using retrieved context
    const system = `
You are Meghan Molloy’s personal AI assistant on her portfolio website.
Be clear, warm, professional, and conversational. Keep answers helpful but not verbose.

Rules:
- Use the CONTEXT to answer factual questions about Meghan (background, location, work history).
- If the answer is not in the CONTEXT, say you don’t know and suggest where to look (e.g., "check the resume page" or "ask Meghan directly").
- Do not guess or invent biographical facts.
`;

    const user = context
      ? `CONTEXT:\n${context}\n\nQUESTION:\n${userMessage}`
      : `QUESTION:\n${userMessage}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system.trim() },
        { role: "user", content: user },
      ],
      temperature: 0.3,
    });

    const reply = completion.choices[0]?.message?.content?.trim() || "";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
