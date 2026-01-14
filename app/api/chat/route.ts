import fs from "fs";
import path from "path";
import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Load embedded vectors at startup
const vectorsPath = path.join(process.cwd(), "data", "vectors.json");
const vectors = JSON.parse(fs.readFileSync(vectorsPath, "utf8"));

function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "No prompt provided" },
        { status: 400 }
      );
    }

    // Create embedding for the user query
    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: prompt,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Rank stored chunks by similarity
    const ranked = vectors
      .map((v: any) => ({
        text: v.text,
        score: cosineSimilarity(queryEmbedding, v.embedding),
      }))
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 5);

    const context = ranked.map((r: any) => r.text).join("\n\n");

    // Generate final answer
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are Meghan Molloy’s personal AI assistant on her portfolio website.

Speak in a friendly, natural, and confident tone — like someone who knows her well.
Keep answers clear and conversational, not long or resume-like.

Rules:
- Start with a direct answer
- Avoid long paragraphs unless asked
- Do NOT mention sources, files, or internal data
- Do NOT sound corporate or overly formal
- You may offer to explain more if helpful
`,
        },
        {
          role: "user",
          content: `Context:\n${context}\n\nQuestion:\n${prompt}`,
        },
      ],
    });

    const answer = chatResponse.choices[0].message.content;

    return NextResponse.json({ answer });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Something went wrong processing the request." },
      { status: 500 }
    );
  }
}
