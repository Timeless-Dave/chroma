"use client";

import {
  Check,
  Copy,
  Pencil,
  RotateCcw,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useState } from "react";

import type { ChatMessage, MessageFeedback } from "@/lib/types";

type MessageActionsProps = {
  message: ChatMessage;
  disabled?: boolean;
  onCopy: () => void;
  onEdit?: () => void;
  onFeedback?: (feedback: MessageFeedback) => void;
  onRedo?: () => void;
};

function ActionButton({
  label,
  onClick,
  disabled,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`rounded-lg p-1.5 transition disabled:opacity-40 ${
        active
          ? "text-zinc-800"
          : "text-zinc-400 hover:bg-black/[0.04] hover:text-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}

export function MessageActions({
  message,
  disabled = false,
  onCopy,
  onEdit,
  onFeedback,
  onRedo,
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }

  if (message.id === "welcome") return null;

  const isUser = message.role === "user";

  return (
    <div
      className={`mt-1.5 flex items-center gap-0.5 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <ActionButton
        label="Copy message"
        disabled={disabled}
        onClick={() => void handleCopy()}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5" />
        ) : (
          <Copy className="h-3.5 w-3.5" />
        )}
      </ActionButton>

      {isUser && onEdit && (
        <ActionButton label="Edit message" disabled={disabled} onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </ActionButton>
      )}

      {!isUser && onFeedback && (
        <>
          <ActionButton
            label="Like response"
            disabled={disabled}
            active={message.feedback === "up"}
            onClick={() =>
              onFeedback(message.feedback === "up" ? null : "up")
            }
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton
            label="Dislike response"
            disabled={disabled}
            active={message.feedback === "down"}
            onClick={() =>
              onFeedback(message.feedback === "down" ? null : "down")
            }
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </ActionButton>
        </>
      )}

      {!isUser && onRedo && (
        <ActionButton label="Redo response" disabled={disabled} onClick={onRedo}>
          <RotateCcw className="h-3.5 w-3.5" />
        </ActionButton>
      )}
    </div>
  );
}
