import {
  DEFAULT_SETTINGS,
  STARTER_QUESTIONS,
  STORAGE_KEYS,
  createId,
  createWelcomeMessage,
} from "@/lib/constants";
import type { AppSettings, ChatSession, DraftChat } from "@/lib/types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadSettings(): AppSettings {
  if (!isBrowser()) return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.settings);
    if (!raw) return DEFAULT_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<AppSettings> & { model?: string };
    return {
      sourceMode: parsed.sourceMode ?? DEFAULT_SETTINGS.sourceMode,
      knowledgeBaseId:
        parsed.knowledgeBaseId ?? DEFAULT_SETTINGS.knowledgeBaseId,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AppSettings): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function createDraftChat(settings: AppSettings): DraftChat {
  return {
    id: createId(),
    messages: [createWelcomeMessage(settings.sourceMode)],
    followUpQuestions: STARTER_QUESTIONS,
  };
}

export function loadSessions(): ChatSession[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEYS.sessions);
    if (!raw) return [];
    return JSON.parse(raw) as ChatSession[];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.sessions, JSON.stringify(sessions));
}

export function loadActiveChatId(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEYS.activeChatId);
}

export function saveActiveChatId(id: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEYS.activeChatId, id);
}
