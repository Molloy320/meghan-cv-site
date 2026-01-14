import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json(
        { error: "No message provided" },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are Meghan Molloy’s personal AI assistant on her portfolio website. Be clear, warm, professional, and conversational. Keep answers helpful but not verbose.",
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content;

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
