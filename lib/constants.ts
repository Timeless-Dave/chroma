import type { AppSettings, ChatMessage, ChatSession } from "@/lib/types";

export const CHAT_MODEL = "gpt-3.5-turbo";

export const STORAGE_KEYS = {
  sessions: "chroma-sessions",
  activeChatId: "chroma-active-chat-id",
  settings: "chroma-settings",
  sidebarCollapsed: "chroma-sidebar-collapsed",
} as const;

export const DEFAULT_SETTINGS: AppSettings = {
  sourceMode: "knowledge",
  knowledgeBaseId: "devcolor",
};

export const STARTER_QUESTIONS = [
  "What is the mission of /dev/color?",
  "What is the A* Program?",
  "In which cities does /dev/color host events?",
  "How can individuals contribute to /dev/color?",
];

export function isEmptyChat(messages: ChatMessage[]): boolean {
  return messages.length === 1 && messages[0]?.id === "welcome";
}

export function getFollowUpsForSession(session: ChatSession): string[] {
  if (session.followUpQuestions?.length) {
    return session.followUpQuestions;
  }

  return isEmptyChat(session.messages) ? STARTER_QUESTIONS : [];
}

export function createWelcomeMessage(
  sourceMode: AppSettings["sourceMode"],
): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      sourceMode === "knowledge"
        ? "Welcome to Chroma. I'm grounded in your selected knowledge brain — ask me anything about /dev/color."
        : "Welcome to Chroma. I'm in Web mode for broader questions. Switch to Knowledge in the chat box for FAQ-grounded answers.",
  };
}

export function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function deriveChatTitle(content: string): string {
  const cleaned = content.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New chat";
  return cleaned.length > 42 ? `${cleaned.slice(0, 42)}…` : cleaned;
}

export function sessionHasStarted(session: ChatSession): boolean {
  return session.messages.some((message) => message.role === "user");
}
