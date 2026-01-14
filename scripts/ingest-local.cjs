require("dotenv").config({ path: ".env.local" });

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Missing OPENAI_API_KEY in .env.local");
  process.exit(1);
}

const PDF_DIR = path.join(process.cwd(), "data", "pdfs");
const OUT_FILE = path.join(process.cwd(), "data", "vectors.json");
const TMP_DIR = path.join(process.cwd(), "data", "_tmp_txt");

function chunkText(text, chunkSize = 1400, overlap = 220) {
  const clean = text
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .trim();

  const chunks = [];
  let i = 0;
  while (i < clean.length) {
    const end = Math.min(i + chunkSize, clean.length);
    chunks.push(clean.slice(i, end));
    i += chunkSize - overlap;
  }
  return chunks;
}

function extractPdfTextWithPoppler(pdfPath) {
  if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true });

  const base = path.basename(pdfPath, path.extname(pdfPath));
  const outTxt = path.join(TMP_DIR, `${base}.txt`);

  // -layout keeps spacing more natural for resumes
  execFileSync("pdftotext", ["-layout", pdfPath, outTxt], { stdio: "ignore" });

  return fs.readFileSync(outTxt, "utf-8");
}

async function embed(text) {
  const res = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "text-embedding-3-small",
      input: text,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Embedding error: ${err}`);
  }

  const data = await res.json();
  return data.data[0].embedding;
}

async function main() {
  if (!fs.existsSync(PDF_DIR)) {
    console.error(`Missing folder: ${PDF_DIR}`);
    process.exit(1);
  }

  const pdfFiles = fs
    .readdirSync(PDF_DIR)
    .filter((f) => f.toLowerCase().endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    console.error(`No PDFs found in ${PDF_DIR}`);
    process.exit(1);
  }

  console.log(`Found ${pdfFiles.length} PDFs in ${PDF_DIR}`);

  const allChunks = [];

  for (const file of pdfFiles) {
    const fullPath = path.join(PDF_DIR, file);
    console.log(`\nReading: ${file}`);

    let text = "";
    try {
      text = extractPdfTextWithPoppler(fullPath);
    } catch (e) {
      console.warn(`⚠️ Could not extract text from ${file}. Is poppler installed?`);
      throw e;
    }

    if (!text.trim()) {
      console.warn(`⚠️ No text extracted from ${file} (might be scanned images)`);
      continue;
    }

    const chunks = chunkText(text);
    console.log(`  Chunks: ${chunks.length}`);

    chunks.forEach((content, idx) => {
      allChunks.push({
        id: `${file}::chunk-${idx}`,
        source: file,
        chunkIndex: idx,
        content,
      });
    });
  }

  console.log(`\nTotal chunks: ${allChunks.length}`);
  console.log("Embedding chunks...");

  const vectors = [];

  for (let i = 0; i < allChunks.length; i++) {
    const c = allChunks[i];
    console.log(`Embedding ${i + 1}/${allChunks.length}: ${c.id}`);

    const input = c.content.slice(0, 3500);
    const embedding = await embed(input);

    vectors.push({ ...c, embedding });
  }

  fs.writeFileSync(
    OUT_FILE,
    JSON.stringify({ createdAt: new Date().toISOString(), vectors }, null, 2)
  );

  console.log(`\n✅ Done. Created: ${OUT_FILE}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
