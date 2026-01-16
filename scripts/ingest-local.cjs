/* scripts/ingest-local.cjs
   Creates a local RAG index from PDFs in /public.
   Output: /data/rag/index.json
*/

const fs = require("fs");
const path = require("path");

const dotenv = require("dotenv");
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// ---- Config ----
const INPUT_PDFS = [
  {
    filePath: path.join(process.cwd(), "public", "about-meghan-molloy.pdf"),
    sourceId: "about-meghan-molloy.pdf",
    title: "About Meghan Molloy",
  },
];

const OUT_DIR = path.join(process.cwd(), "data", "rag");
const OUT_FILE = path.join(OUT_DIR, "index.json");

const EMBEDDING_MODEL =
  process.env.OPENAI_EMBEDDING_MODEL || "text-embedding-3-small";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Chunking
const CHUNK_SIZE = 900; // characters
const CHUNK_OVERLAP = 150;

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function fileExists(p) {
  try {
    fs.accessSync(p, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

function normalizeText(s) {
  return String(s || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

function chunkText(text) {
  const chunks = [];
  let i = 0;

  while (i < text.length) {
    const end = Math.min(i + CHUNK_SIZE, text.length);
    const slice = text.slice(i, end).trim();
    if (slice) chunks.push(slice);
    i = end - CHUNK_OVERLAP;
    if (i < 0) i = 0;
    if (end === text.length) break;
  }

  return chunks;
}

async function extractPdfText(pdfPath) {
  // Known-good CJS version recommended: pdf-parse@1.1.1
  const pdfParse = require("pdf-parse");
  if (typeof pdfParse !== "function") {
    throw new Error("pdf-parse did not return a function. Ensure pdf-parse@1.1.1 is installed.");
  }

  const buf = fs.readFileSync(pdfPath);
  const data = await pdfParse(buf);
  return normalizeText((data && data.text) || "");
}

async function embedBatch(texts) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Make sure it exists in .env.local.");
  }

  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: EMBEDDING_MODEL,
      input: texts,
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `Embeddings request failed: ${res.status} ${res.statusText}\n${errText}`
    );
  }

  const json = await res.json();
  return (json.data || []).map((d) => d.embedding);
}

function loadExistingIndex() {
  if (!fileExists(OUT_FILE)) return [];
  try {
    const raw = fs.readFileSync(OUT_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveIndex(items) {
  ensureDir(OUT_DIR);
  fs.writeFileSync(OUT_FILE, JSON.stringify(items, null, 2), "utf8");
}

async function main() {
  console.log("Ingest starting...");
  console.log("OPENAI_API_KEY loaded:", !!process.env.OPENAI_API_KEY);

  for (const pdf of INPUT_PDFS) {
    if (!fileExists(pdf.filePath)) {
      throw new Error(
        `PDF not found: ${pdf.filePath}\nMake sure it exists in /public and is named exactly: about-meghan-molloy.pdf`
      );
    }
  }

  const existing = loadExistingIndex();
  const sourceIds = new Set(INPUT_PDFS.map((x) => x.sourceId));
  const kept = existing.filter((item) => !sourceIds.has(item.sourceId));

  const newItems = [];

  for (const pdf of INPUT_PDFS) {
    console.log("Reading:", pdf.filePath);

    const text = await extractPdfText(pdf.filePath);
    if (!text) {
      console.warn("No text extracted from:", pdf.sourceId);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`Chunked ${pdf.sourceId}: ${chunks.length} chunks`);

    const BATCH = 64;
    for (let i = 0; i < chunks.length; i += BATCH) {
      const batchTexts = chunks.slice(i, i + BATCH);
      const vectors = await embedBatch(batchTexts);

      for (let j = 0; j < batchTexts.length; j++) {
        const chunkIndex = i + j;
        newItems.push({
          id: `${pdf.sourceId}::${chunkIndex}`,
          sourceId: pdf.sourceId,
          title: pdf.title,
          chunkIndex,
          text: batchTexts[j],
          embedding: vectors[j],
          meta: {
            authority: "primary",
            topic: "biographical",
          },
        });
      }

      console.log(
        `Embedded ${Math.min(i + BATCH, chunks.length)}/${chunks.length} chunks for ${pdf.sourceId}`
      );
    }
  }

  const finalIndex = [...kept, ...newItems];
  saveIndex(finalIndex);

  console.log("Ingest complete.");
  console.log("Wrote:", OUT_FILE);
  console.log("Total items:", finalIndex.length);
}

main().catch((err) => {
  console.error("Ingest failed:", err);
  process.exit(1);
});
