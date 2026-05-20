import { CHAT_MODEL } from "@/lib/constants";
import type { SourceMode } from "@/lib/types";
import OpenAI from "openai";

let client: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  return client;
}

export async function getEmbedding(text: string): Promise<number[]> {
  const response = await getOpenAIClient().embeddings.create({
    input: text,
    model: "text-embedding-3-small",
  });

  return response.data[0].embedding;
}

type GenerateParams = {
  query: string;
  sourceMode: SourceMode;
  contextChunks?: string[];
  attachmentContext?: string;
  knowledgeBaseName?: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export async function generateChatResponse({
  query,
  sourceMode,
  contextChunks = [],
  attachmentContext,
  knowledgeBaseName,
  history = [],
}: GenerateParams): Promise<string> {
  const trimmedAttachment = attachmentContext?.trim();
  const historyMessages = history.slice(-8).map((entry) => ({
    role: entry.role as "user" | "assistant",
    content: entry.content,
  }));

  if (sourceMode === "knowledge") {
    const contextText =
      contextChunks.length > 0
        ? contextChunks.join("\n\n---\n\n")
        : "No relevant context was retrieved.";
    const attachmentBlock = trimmedAttachment
      ? `\n\nAdditional user-provided context:\n${trimmedAttachment}`
      : "";

    const response = await getOpenAIClient().chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are Chroma, a helpful assistant grounded in the "${knowledgeBaseName ?? "selected"}" knowledge base. Answer using ONLY the provided context. If the context does not contain the answer, say you do not have that information.`,
        },
        ...historyMessages,
        {
          role: "user",
          content: `Context Information:\n${contextText}${attachmentBlock}\n\nUser Question: ${query}`,
        },
      ],
    });

    return response.choices[0].message.content ?? "";
  }

  const attachmentBlock = trimmedAttachment
    ? `\n\nAdditional context from an attached file:\n${trimmedAttachment}`
    : "";

  const response = await getOpenAIClient().chat.completions.create({
    model: CHAT_MODEL,
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are Chroma, a helpful assistant answering from general model knowledge in Web mode. Be concise, accurate, and note when information may be outdated.",
      },
      ...historyMessages,
      {
        role: "user",
        content: `${query}${attachmentBlock}`,
      },
    ],
  });

  return response.choices[0].message.content ?? "";
}

export async function generateFollowUpQuestions(
  query: string,
  reply: string,
): Promise<string[]> {
  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: `Based on this exchange, suggest exactly 3 short, natural follow-up questions the user might ask next. Return JSON: {"questions":["...","...","..."]}\n\nUser: ${query}\nAssistant: ${reply}`,
        },
      ],
    });

    const parsed = JSON.parse(
      response.choices[0].message.content ?? "{}",
    ) as { questions?: string[] };

    return (parsed.questions ?? []).filter(Boolean).slice(0, 3);
  } catch {
    return [];
  }
}
