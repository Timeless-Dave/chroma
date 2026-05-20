import { loadAndChunkCorpus } from "@/lib/chunking";
import { getKnowledgeBase } from "@/lib/knowledge-bases";
import { getEmbedding } from "@/lib/openai";
import { retrieveContext } from "@/lib/similarity";

type CorpusCache = {
  chunks: string[];
  chunkEmbeddings: number[][];
};

const globalForRag = globalThis as typeof globalThis & {
  ragCacheMap?: Map<string, Promise<CorpusCache>>;
};

function getCacheMap(): Map<string, Promise<CorpusCache>> {
  if (!globalForRag.ragCacheMap) {
    globalForRag.ragCacheMap = new Map();
  }

  return globalForRag.ragCacheMap;
}

async function buildCorpusCache(knowledgeBaseId: string): Promise<CorpusCache> {
  const knowledgeBase = getKnowledgeBase(knowledgeBaseId);
  const chunks = loadAndChunkCorpus(knowledgeBase.filename);
  const chunkEmbeddings = await Promise.all(
    chunks.map((chunk) => getEmbedding(chunk)),
  );

  return { chunks, chunkEmbeddings };
}

export async function getCorpusCache(
  knowledgeBaseId: string,
): Promise<CorpusCache> {
  const cacheMap = getCacheMap();

  if (!cacheMap.has(knowledgeBaseId)) {
    cacheMap.set(knowledgeBaseId, buildCorpusCache(knowledgeBaseId));
  }

  return cacheMap.get(knowledgeBaseId)!;
}

export async function retrieveRelevantChunks(
  query: string,
  knowledgeBaseId: string,
  topK = 2,
): Promise<string[]> {
  const { chunks, chunkEmbeddings } = await getCorpusCache(knowledgeBaseId);
  const queryEmbedding = await getEmbedding(query);

  return retrieveContext(queryEmbedding, chunkEmbeddings, chunks, topK);
}
