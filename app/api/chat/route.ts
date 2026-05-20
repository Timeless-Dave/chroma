import { NextResponse } from "next/server";

import { retrieveRelevantChunks } from "@/lib/corpus-cache";
import { getKnowledgeBase, KNOWLEDGE_BASES } from "@/lib/knowledge-bases";
import { generateChatResponse, generateFollowUpQuestions } from "@/lib/openai";
import type { ChatRequest, ChatResponse } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const body = (await request.json()) as ChatRequest;
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const sourceMode = body.sourceMode ?? "knowledge";
    const knowledgeBaseId = body.knowledgeBaseId ?? "devcolor";
    const knowledgeBase = getKnowledgeBase(knowledgeBaseId);

    const contextChunks =
      sourceMode === "knowledge"
        ? await retrieveRelevantChunks(message, knowledgeBaseId, 2)
        : [];

    const reply = await generateChatResponse({
      query: message,
      sourceMode,
      contextChunks,
      attachmentContext: body.attachmentContext,
      knowledgeBaseName: knowledgeBase.name,
      history: body.history,
    });

    const followUpQuestions = await generateFollowUpQuestions(message, reply);

    const response: ChatResponse = { reply, followUpQuestions };
    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    const message =
      error instanceof Error ? error.message : "Something went wrong.";

    return NextResponse.json(
      {
        error: message.includes("not found")
          ? message
          : "Something went wrong while generating a response.",
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({ knowledgeBases: KNOWLEDGE_BASES });
}
