"use client";

import { useState } from "react";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, something went wrong.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Network error." },
      ]);
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">Ask Meghan</h1>
      <p className="mt-2 opacity-80">
        Ask about experience, skills, education, or background.
      </p>

      <div className="mt-6 rounded-xl border p-4 space-y-4">
        <div className="space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user" ? "text-right" : "text-left"
              }
            >
              <div
                className={
                  "inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm " +
                  (msg.role === "user"
                    ? "border"
                    : "bg-black text-white")
                }
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          <input
            className="flex-1 rounded-xl border px-4 py-2 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            className="rounded-xl border px-4 py-2 text-sm"
            onClick={sendMessage}
            disabled={loading}
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </main>
  );
}
