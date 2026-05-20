export function cosineSimilarity(v1: number[], v2: number[]): number {
  let dotProduct = 0;
  let normV1 = 0;
  let normV2 = 0;

  for (let i = 0; i < v1.length; i++) {
    dotProduct += v1[i] * v2[i];
    normV1 += v1[i] * v1[i];
    normV2 += v2[i] * v2[i];
  }

  if (normV1 === 0 || normV2 === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normV1) * Math.sqrt(normV2));
}

export function retrieveContext(
  queryEmbedding: number[],
  chunkEmbeddings: number[][],
  chunks: string[],
  topK = 2,
): string[] {
  const similarities = chunkEmbeddings.map((chunkEmbedding, index) => ({
    similarity: cosineSimilarity(queryEmbedding, chunkEmbedding),
    chunk: chunks[index],
  }));

  similarities.sort((a, b) => b.similarity - a.similarity);

  return similarities.slice(0, topK).map(({ chunk }) => chunk);
}
