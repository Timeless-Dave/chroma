"use client";

import { useState } from "react";

import { ChromaLoading } from "@/components/chroma-loading";
import { ChromaLogo } from "@/components/chroma-logo";
import { MessageActions } from "@/components/message-actions";
import { isEmptyChat } from "@/lib/constants";
import type { ChatMessage, MessageFeedback } from "@/lib/types";

type MessageListProps = {
  messages: ChatMessage[];
  isLoading: boolean;
  isBusy?: boolean;
  onEditMessage?: (messageId: string, content: string) => void;
  onRegenerate?: (assistantMessageId: string) => void;
  onFeedback?: (messageId: string, feedback: MessageFeedback) => void;
};

function EditableUserMessage({
  message,
  disabled,
  onSave,
  onCancel,
}: {
  message: ChatMessage;
  disabled?: boolean;
  onSave: (content: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(message.content);

  return (
    <div className="max-w-[min(100%,680px)]">
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={3}
        disabled={disabled}
        className="w-full resize-none rounded-2xl bg-zinc-900 px-4 py-3 text-[15px] leading-7 text-zinc-50 outline-none"
      />
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-3 py-1.5 text-xs text-zinc-500 transition hover:text-zinc-700"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={disabled || !draft.trim()}
          onClick={() => onSave(draft.trim())}
          className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs text-zinc-50 transition hover:bg-zinc-800 disabled:opacity-50"
        >
          Save & resend
        </button>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isLoading,
  isBusy = false,
  onEditMessage,
  onRegenerate,
  onFeedback,
}: MessageListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const showEmptyState = isEmptyChat(messages);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-3 py-6 sm:px-4">
      {showEmptyState && (
        <div className="flex flex-col items-center px-2 py-10 text-center sm:py-16">
          <ChromaLogo size="lg" className="mb-5" />
          <h2 className="text-xl font-medium tracking-tight text-zinc-900 sm:text-2xl">
            How can I help you today?
          </h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
            Ask about /dev/color, switch sources below, or explore Web mode.
          </p>
        </div>
      )}

      {messages
        .filter((message) => !showEmptyState || message.id !== "welcome")
        .map((message) => {
          const isEditing = editingId === message.id;

          return (
            <article
              key={message.id}
              className={`group flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className="max-w-[min(100%,680px)]">
                {isEditing && message.role === "user" ? (
                  <EditableUserMessage
                    message={message}
                    disabled={isBusy}
                    onCancel={() => setEditingId(null)}
                    onSave={(content) => {
                      setEditingId(null);
                      onEditMessage?.(message.id, content);
                    }}
                  />
                ) : (
                  <>
                    <div
                      className={`rounded-2xl px-4 py-3 text-[15px] leading-7 ${
                        message.role === "user"
                          ? "bg-zinc-900 text-zinc-50"
                          : "bg-zinc-100 text-zinc-900"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>

                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5 pt-1">
                          {message.attachments.map((attachment) => (
                            <span
                              key={attachment.id}
                              className={`inline-flex items-center rounded-lg px-2 py-1 text-xs ${
                                message.role === "user"
                                  ? "bg-zinc-800 text-zinc-200"
                                  : "bg-zinc-200 text-zinc-700"
                              }`}
                            >
                              {attachment.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <MessageActions
                      message={message}
                      disabled={isBusy}
                      onCopy={() =>
                        void navigator.clipboard.writeText(message.content)
                      }
                      onEdit={
                        message.role === "user" && onEditMessage
                          ? () => setEditingId(message.id)
                          : undefined
                      }
                      onFeedback={
                        message.role === "assistant" && onFeedback
                          ? (feedback) => onFeedback(message.id, feedback)
                          : undefined
                      }
                      onRedo={
                        message.role === "assistant" && onRegenerate
                          ? () => onRegenerate(message.id)
                          : undefined
                      }
                    />
                  </>
                )}
              </div>
            </article>
          );
        })}

      {isLoading && (
        <div className="flex justify-start py-1 pl-1">
          <ChromaLoading />
        </div>
      )}
    </div>
  );
}
