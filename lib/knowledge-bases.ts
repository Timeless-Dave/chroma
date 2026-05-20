import type { KnowledgeBase } from "@/lib/types";

export const KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: "devcolor",
    name: "/dev/color FAQ",
    description: "Membership, programs, events, and impact data",
    filename: "devcolorfaq.txt",
  },
  {
    id: "chroma",
    name: "Chroma Guide",
    description: "How Chroma modes, settings, and features work",
    filename: "chroma-basics.txt",
  },
];

export function getKnowledgeBase(id: string): KnowledgeBase {
  return (
    KNOWLEDGE_BASES.find((base) => base.id === id) ?? KNOWLEDGE_BASES[0]
  );
}

export function getKnowledgeBasePath(filename: string): string {
  return filename;
}
