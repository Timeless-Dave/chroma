"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { ChatHeader } from "@/components/chat-header";
import { ChatInput } from "@/components/chat-input";
import { ChromaLogo } from "@/components/chroma-logo";
import { FollowUpSuggestions } from "@/components/follow-up-suggestions";
import { MessageList } from "@/components/message-list";
import { Sidebar } from "@/components/sidebar";
import {
  createId,
  createWelcomeMessage,
  DEFAULT_SETTINGS,
  deriveChatTitle,
  getFollowUpsForSession,
  isEmptyChat,
  sessionHasStarted,
  STARTER_QUESTIONS,
  STORAGE_KEYS,
} from "@/lib/constants";
import {
  createDraftChat,
  loadActiveChatId,
  loadSessions,
  loadSettings,
  saveActiveChatId,
  saveSessions,
  saveSettings,
} from "@/lib/storage";
import type {
  AppSettings,
  ChatMessage,
  ChatResponse,
  ChatSession,
  DraftChat,
  MessageAttachment,
  MessageFeedback,
} from "@/lib/types";

function buildAttachmentContext(attachments: MessageAttachment[]): string {
  return attachments
    .filter((attachment) => attachment.type === "text" && attachment.content)
    .map(
      (attachment) =>
        `File: ${attachment.name}\n${attachment.content?.slice(0, 4000)}`,
    )
    .join("\n\n");
}

function resolveOutgoingMessage(
  content: string,
  attachments: MessageAttachment[],
): string {
  const trimmed = content.trim();

  if (trimmed) return trimmed;

  if (attachments.some((attachment) => attachment.type === "text")) {
    return "Please answer using the attached text file as context.";
  }

  if (attachments.some((attachment) => attachment.type === "image")) {
    return "I've attached an image for reference.";
  }

  return trimmed;
}

export function ChromaApp() {
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [draftChat, setDraftChat] = useState<DraftChat | null>(null);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [input, setInput] = useState("");
  const [loadingChatId, setLoadingChatId] = useState<string | null>(null);
  const [followUps, setFollowUps] = useState<string[]>(STARTER_QUESTIONS);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isDraft = Boolean(draftChat && activeChatId === draftChat.id);

  const activeSession = useMemo(() => {
    if (isDraft && draftChat) {
      return null;
    }

    return sessions.find((session) => session.id === activeChatId) ?? null;
  }, [sessions, activeChatId, isDraft, draftChat]);

  const messages = useMemo(() => {
    if (isDraft && draftChat) {
      return draftChat.messages;
    }

    return activeSession?.messages ?? draftChat?.messages ?? [];
  }, [activeSession, draftChat, isDraft]);

  const isLoading = loadingChatId === activeChatId;

  useEffect(() => {
    const storedSettings = loadSettings();
    const storedSessions = loadSessions().filter(sessionHasStarted);
    const storedActiveId = loadActiveChatId();
    const initialDraft = createDraftChat(storedSettings);
    const storedCollapsed =
      localStorage.getItem(STORAGE_KEYS.sidebarCollapsed) === "true";

    const activeId =
      storedActiveId &&
      storedSessions.some((session) => session.id === storedActiveId)
        ? storedActiveId
        : initialDraft.id;

    const activeSessionOnLoad =
      storedSessions.find((session) => session.id === activeId) ?? null;

    setSettings(storedSettings);
    setSessions(storedSessions);
    setDraftChat(initialDraft);
    setActiveChatId(activeId);
    setSidebarCollapsed(storedCollapsed);
    setFollowUps(
      activeSessionOnLoad
        ? getFollowUpsForSession(activeSessionOnLoad)
        : initialDraft.followUpQuestions,
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveSessions(sessions);
  }, [sessions, hydrated]);

  useEffect(() => {
    if (!hydrated || !activeChatId || isDraft) return;
    saveActiveChatId(activeChatId);
  }, [activeChatId, hydrated, isDraft]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEYS.sidebarCollapsed,
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    saveSettings(settings);
  }, [settings, hydrated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, followUps]);

  const updateSession = useCallback(
    (sessionId: string, updater: (session: ChatSession) => ChatSession) => {
      setSessions((current) =>
        current.map((session) =>
          session.id === sessionId ? updater(session) : session,
        ),
      );
    },
    [],
  );

  const handleSidebarToggle = useCallback(() => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setSidebarCollapsed((value) => !value);
      return;
    }

    setSidebarOpen((value) => !value);
  }, []);

  const selectChat = useCallback(
    (id: string) => {
      const session = sessions.find((entry) => entry.id === id);
      setActiveChatId(id);
      setInput("");
      setFollowUps(session ? getFollowUpsForSession(session) : STARTER_QUESTIONS);
      setSidebarOpen(false);
    },
    [sessions],
  );

  const handleNewChat = useCallback(() => {
    const nextDraft = createDraftChat(settings);
    setDraftChat(nextDraft);
    setActiveChatId(nextDraft.id);
    setInput("");
    setFollowUps(STARTER_QUESTIONS);
    setSidebarOpen(false);
  }, [settings]);

  const handleDeleteChat = useCallback(
    (sessionId: string) => {
      setSessions((current) => {
        const next = current.filter((session) => session.id !== sessionId);

        if (next.length === 0) {
          const freshDraft = createDraftChat(settings);
          setDraftChat(freshDraft);
          setActiveChatId(freshDraft.id);
          setFollowUps(STARTER_QUESTIONS);
          return [];
        }

        if (sessionId === activeChatId) {
          const replacement = next[0];
          setActiveChatId(replacement.id);
          setFollowUps(getFollowUpsForSession(replacement));
        }

        return next;
      });
    },
    [activeChatId, settings],
  );

  const fetchAssistantReply = useCallback(
    async (
      sessionId: string,
      trimmed: string,
      historyMessages: ChatMessage[],
      attachmentContext = "",
      hadOnlyWelcome = false,
    ) => {
      setLoadingChatId(sessionId);
      setFollowUps([]);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: trimmed,
            sourceMode: settings.sourceMode,
            knowledgeBaseId: settings.knowledgeBaseId,
            attachmentContext,
            history: historyMessages.map((message) => ({
              role: message.role,
              content: message.content,
            })),
          }),
        });

        const data = (await response.json()) as ChatResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Failed to get a response.");
        }

        const assistantMessage: ChatMessage = {
          id: createId(),
          role: "assistant",
          content: data.reply || "Sorry, I couldn't generate a response.",
        };

        const nextFollowUps = data.followUpQuestions?.length
          ? data.followUpQuestions
          : hadOnlyWelcome
            ? STARTER_QUESTIONS
            : [];

        updateSession(sessionId, (session) => ({
          ...session,
          updatedAt: Date.now(),
          messages: [...session.messages, assistantMessage],
          followUpQuestions: nextFollowUps,
        }));

        if (activeChatId === sessionId) {
          setFollowUps(nextFollowUps);
        }
      } catch (error) {
        updateSession(sessionId, (session) => ({
          ...session,
          updatedAt: Date.now(),
          messages: [
            ...session.messages,
            {
              id: createId(),
              role: "assistant",
              content:
                error instanceof Error
                  ? error.message
                  : "Something went wrong. Please try again.",
            },
          ],
          followUpQuestions: STARTER_QUESTIONS,
        }));

        if (activeChatId === sessionId) {
          setFollowUps(STARTER_QUESTIONS);
        }
      } finally {
        setLoadingChatId((current) => (current === sessionId ? null : current));
      }
    },
    [activeChatId, settings, updateSession],
  );

  const sendMessage = useCallback(
    async (content: string, attachments: MessageAttachment[] = []) => {
      const trimmed = resolveOutgoingMessage(content, attachments);
      if (!trimmed || !activeChatId || !draftChat || loadingChatId === activeChatId) {
        return;
      }

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        content: trimmed,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      let sessionId = activeChatId;
      let historyBeforeSend = messages.filter(
        (message) => message.id !== "welcome",
      );
      let hadOnlyWelcome = isEmptyChat(messages);

      if (isDraft) {
        sessionId = draftChat.id;
        historyBeforeSend = [];
        hadOnlyWelcome = true;

        const newSession: ChatSession = {
          id: sessionId,
          title: deriveChatTitle(trimmed),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [...draftChat.messages, userMessage],
          followUpQuestions: [],
        };

        setSessions((current) => [newSession, ...current]);
        setDraftChat(createDraftChat(settings));
        setActiveChatId(sessionId);
      } else {
        updateSession(sessionId, (session) => {
          const hasUserMessages = session.messages.some(
            (message) => message.role === "user",
          );

          return {
            ...session,
            title: hasUserMessages ? session.title : deriveChatTitle(trimmed),
            updatedAt: Date.now(),
            messages: [...session.messages, userMessage],
            followUpQuestions: [],
          };
        });
      }

      setInput("");

      await fetchAssistantReply(
        sessionId,
        trimmed,
        historyBeforeSend,
        buildAttachmentContext(attachments),
        hadOnlyWelcome,
      );
    },
    [
      activeChatId,
      draftChat,
      fetchAssistantReply,
      isDraft,
      loadingChatId,
      messages,
      settings,
      updateSession,
    ],
  );

  const handleEditMessage = useCallback(
    (messageId: string, content: string) => {
      if (!activeChatId || loadingChatId === activeChatId || !content.trim()) {
        return;
      }

      const session = sessions.find((entry) => entry.id === activeChatId);
      if (!session) return;

      const messageIndex = session.messages.findIndex(
        (message) => message.id === messageId,
      );
      if (messageIndex === -1) return;

      const trimmed = content.trim();
      const nextMessages = session.messages
        .slice(0, messageIndex + 1)
        .map((message) =>
          message.id === messageId ? { ...message, content: trimmed } : message,
        );
      const history = nextMessages
        .slice(0, messageIndex)
        .filter((message) => message.id !== "welcome");
      const editedMessage = nextMessages[messageIndex];

      updateSession(activeChatId, (current) => ({
        ...current,
        updatedAt: Date.now(),
        messages: nextMessages,
        followUpQuestions: [],
      }));

      void fetchAssistantReply(
        activeChatId,
        trimmed,
        history,
        buildAttachmentContext(editedMessage.attachments ?? []),
      );
    },
    [activeChatId, fetchAssistantReply, loadingChatId, sessions, updateSession],
  );

  const handleRegenerate = useCallback(
    (assistantMessageId: string) => {
      if (!activeChatId || loadingChatId === activeChatId) return;

      const session = sessions.find((entry) => entry.id === activeChatId);
      if (!session) return;

      const assistantIndex = session.messages.findIndex(
        (message) => message.id === assistantMessageId,
      );
      if (assistantIndex === -1) return;

      let userIndex = assistantIndex - 1;
      while (
        userIndex >= 0 &&
        session.messages[userIndex]?.role !== "user"
      ) {
        userIndex -= 1;
      }

      if (userIndex < 0) return;

      const userMessage = session.messages[userIndex];
      const baseMessages = session.messages.slice(0, assistantIndex);
      const history = session.messages
        .slice(0, userIndex)
        .filter((message) => message.id !== "welcome");

      updateSession(activeChatId, (current) => ({
        ...current,
        updatedAt: Date.now(),
        messages: baseMessages,
        followUpQuestions: [],
      }));

      void fetchAssistantReply(
        activeChatId,
        userMessage.content,
        history,
        buildAttachmentContext(userMessage.attachments ?? []),
      );
    },
    [activeChatId, fetchAssistantReply, loadingChatId, sessions, updateSession],
  );

  const handleFeedback = useCallback(
    (messageId: string, feedback: MessageFeedback) => {
      if (!activeChatId) return;

      updateSession(activeChatId, (session) => ({
        ...session,
        messages: session.messages.map((message) =>
          message.id === messageId ? { ...message, feedback } : message,
        ),
      }));
    },
    [activeChatId, updateSession],
  );

  if (!hydrated || !draftChat) {
    return (
      <div className="flex h-dvh items-center justify-center bg-[var(--background)]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-pulse">
            <ChromaLogo size="md" />
          </div>
          <p className="text-sm text-zinc-500">Loading Chroma...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-[var(--background)]">
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        sessions={sessions}
        activeChatId={isDraft ? null : activeChatId}
        onClose={() => setSidebarOpen(false)}
        onNewChat={handleNewChat}
        onSelectChat={selectChat}
        onRenameChat={(id, title) => {
          updateSession(id, (session) => ({
            ...session,
            title,
            updatedAt: Date.now(),
          }));
        }}
        onDeleteChat={handleDeleteChat}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <ChatHeader onToggleSidebar={handleSidebarToggle} />

        <main className="chroma-scroll flex-1 overflow-y-auto">
          <MessageList
            messages={messages}
            isLoading={isLoading}
            isBusy={Boolean(loadingChatId)}
            onEditMessage={handleEditMessage}
            onRegenerate={handleRegenerate}
            onFeedback={handleFeedback}
          />
          <div ref={messagesEndRef} />
        </main>

        <FollowUpSuggestions
          suggestions={followUps}
          disabled={isLoading}
          onSelect={(question) => {
            setInput("");
            void sendMessage(question);
          }}
        />

        <ChatInput
          value={input}
          disabled={!activeChatId}
          isLoading={isLoading}
          settings={settings}
          onSettingsChange={(nextSettings) => {
            setSettings(nextSettings);

            if (isDraft) {
              setDraftChat((current) =>
                current
                  ? {
                      ...current,
                      messages: [createWelcomeMessage(nextSettings.sourceMode)],
                    }
                  : current,
              );
              return;
            }

            if (
              activeChatId &&
              messages.length === 1 &&
              messages[0]?.id === "welcome"
            ) {
              updateSession(activeChatId, (session) => ({
                ...session,
                messages: [createWelcomeMessage(nextSettings.sourceMode)],
              }));
            }
          }}
          onChange={setInput}
          onSubmit={(attachments) => void sendMessage(input, attachments)}
        />
      </div>
    </div>
  );
}
