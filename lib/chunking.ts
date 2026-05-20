import fs from "fs";
import path from "path";

export function loadAndChunkCorpus(filename: string): string[] {
  const corpusPath = path.join(process.cwd(), "knowledge", filename);

  if (!fs.existsSync(corpusPath)) {
    throw new Error(`Knowledge base file not found: ${filename}`);
  }

  const text = fs.readFileSync(corpusPath, "utf-8");

  const chunks = text
    .trim()
    .split(/\n(?=\d+\.\s\*\*)/)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  if (chunks.length === 0) {
    throw new Error(`Knowledge base "${filename}" has no readable entries.`);
  }

  return chunks;
}
