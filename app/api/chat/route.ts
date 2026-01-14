import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type VectorRow = { embedding: number[]; text: string };

const vectorsPath = path.join(process.cwd(), "data", "vectors.json");
const vectors: VectorRow[] = JSON.parse(fs.readFileSync(vectorsPath, "utf8"));

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both shapes: { message: "..."} (your chat UI) OR { prompt: "..."} (older version)
    const userText: string = (body?.message ?? body?.prompt ?? "").trim();

    if (!userText) {
      return NextResponse.json(
        { error: "Missing message. Send JSON: { message: \"...\" }" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Server missing OPENAI_API_KEY environment variable." },
        { status: 500 }
      );
    }

    // Embed query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: userText,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Retrieve top chunks
    const ranked = vectors
      .map((v) => ({
        text: v.text,
        score: cosineSimilarity(queryEmbedding, v.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    const context = ranked.map((r) => r.text).join("\n\n");

    // Generate answer (no sources)
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content: `You are Meghan Molloy’s personal AI assistant on her portfolio website.

Speak in a friendly, natural, confident tone — like someone who knows her well.
Keep answers clear and conversational, not long or resume-like.

Rules:
- Start with a direct answer
- Avoid long paragraphs unless asked
- Do NOT mention sources, files, chunks, or internal data
- Do NOT sound corporate or overly formal
- If you’re not sure, say so briefly and offer what you can`,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${userText}`,
        },
      ],
    });

    const answer = chatResponse.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ answer });
  } catch (err: any) {
    console.error("API /api/chat error:", err);

    // Try to return something usable to the UI
    return NextResponse.json(
      { error: "Chat API crashed. Check Vercel logs for details." },
      { status: 500 }
    );
  }
}
