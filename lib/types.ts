export type SourceMode = "knowledge" | "web";

export type MessageRole = "user" | "assistant";

export type MessageAttachment = {
  id: string;
  name: string;
  type: "text" | "image";
  content?: string;
  previewUrl?: string;
};

export type MessageFeedback = "up" | "down" | null;

export type ChatMessage = {
  id: string;
  role: MessageRole;
  content: string;
  attachments?: MessageAttachment[];
  feedback?: MessageFeedback;
};

export type DraftChat = {
  id: string;
  messages: ChatMessage[];
  followUpQuestions: string[];
};

export type ChatSession = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  followUpQuestions?: string[];
};

export type AppSettings = {
  sourceMode: SourceMode;
  knowledgeBaseId: string;
};

export type KnowledgeBase = {
  id: string;
  name: string;
  description: string;
  filename: string;
};

export type ChatRequest = {
  message: string;
  sourceMode: SourceMode;
  knowledgeBaseId?: string;
  attachmentContext?: string;
  history?: Array<{ role: MessageRole; content: string }>;
};

export type ChatResponse = {
  reply: string;
  followUpQuestions: string[];
};
