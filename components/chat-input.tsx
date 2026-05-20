"use client";

import {
  ArrowUp,
  FileText,
  ImagePlus,
  Mic,
  MicOff,
  Plus,
  X,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { SourcePicker } from "@/components/source-picker";
import { createId } from "@/lib/constants";
import type { AppSettings, MessageAttachment } from "@/lib/types";

type SpeechRecognitionInstance = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: {
    results: Array<Array<{ transcript?: string }>>;
  }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type ChatInputProps = {
  value: string;
  disabled?: boolean;
  isLoading?: boolean;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
  onChange: (value: string) => void;
  onSubmit: (attachments: MessageAttachment[]) => void;
};

export function ChatInput({
  value,
  disabled = false,
  isLoading = false,
  settings,
  onSettingsChange,
  onChange,
  onSubmit,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [attachOpen, setAttachOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const canSend = Boolean(value.trim()) || attachments.length > 0;
  const showSend = canSend && !isListening;

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2800);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!attachOpen) return;

    function handleClick(event: MouseEvent) {
      if (!attachRef.current?.contains(event.target as Node)) {
        setAttachOpen(false);
      }
    }

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setAttachOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [attachOpen]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  function handleSubmit(event?: FormEvent) {
    event?.preventDefault();
    if (!canSend || disabled || isLoading) return;
    onSubmit(attachments);
    setAttachments([]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  }

  async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setAttachOpen(false);

    if (!file) return;

    if (!file.name.endsWith(".txt") && file.type !== "text/plain") {
      setNotice("Only plain text files are supported for now.");
      return;
    }

    const content = await file.text();
    setAttachments((current) => [
      ...current,
      { id: createId(), name: file.name, type: "text", content },
    ]);
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    setAttachOpen(false);

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setNotice("Please choose an image file.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setAttachments((current) => [
      ...current,
      { id: createId(), name: file.name, type: "image", previewUrl },
    ]);
    setNotice("Image attached for reference. Vision analysis is coming soon.");
  }

  function stopListening() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setIsListening(false);
  }

  function toggleListening() {
    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognitionCtor = (
      window as Window & {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      }
    ).SpeechRecognition ||
      (
        window as Window & {
          webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
        }
      ).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      setNotice("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionCtor();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      recognitionRef.current = null;
      setIsListening(false);
    };
    recognition.onerror = () => {
      recognitionRef.current = null;
      setIsListening(false);
      setNotice("Could not capture speech. Try again.");
    };
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript?.trim();
      if (transcript) {
        onChange(value ? `${value} ${transcript}` : transcript);
      }
    };

    recognition.start();
  }

  function removeAttachment(id: string) {
    setAttachments((current) => {
      const target = current.find((item) => item.id === id);
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  }

  return (
    <div className="bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent px-3 pb-4 pt-2 sm:px-4 sm:pb-5">
      <div className="mx-auto w-full max-w-3xl">
        {notice && (
          <p className="mb-2 text-center text-xs text-zinc-500">{notice}</p>
        )}

        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((attachment) => (
              <span
                key={attachment.id}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/[0.05] px-2.5 py-1 text-xs text-zinc-600"
              >
                {attachment.type === "image" ? (
                  <ImagePlus className="h-3.5 w-3.5" />
                ) : (
                  <FileText className="h-3.5 w-3.5" />
                )}
                {attachment.name}
                <button
                  type="button"
                  aria-label={`Remove ${attachment.name}`}
                  onClick={() => removeAttachment(attachment.id)}
                  className="rounded-full p-0.5 opacity-60 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.05)] backdrop-blur-xl focus-within:shadow-[0_1px_2px_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.07)]"
        >
          <div ref={attachRef} className="relative shrink-0">
            <button
              type="button"
              aria-label="Attach"
              aria-expanded={attachOpen}
              aria-haspopup="menu"
              disabled={disabled || isLoading}
              onClick={() => setAttachOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-zinc-500 transition hover:bg-black/[0.04] hover:text-zinc-800 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
            </button>

            {attachOpen && (
              <div
                role="menu"
                className="absolute bottom-full left-0 z-50 mb-2 min-w-[160px] overflow-hidden rounded-2xl bg-white/95 p-1 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-black/[0.04]"
                >
                  <FileText className="h-4 w-4 text-zinc-500" />
                  Upload file
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm text-zinc-700 transition hover:bg-black/[0.04]"
                >
                  <ImagePlus className="h-4 w-4 text-zinc-500" />
                  Upload image
                </button>
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Chroma"
            disabled={disabled || isLoading}
            className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-[15px] text-zinc-900 outline-none placeholder:text-zinc-400 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <SourcePicker
            settings={settings}
            disabled={disabled || isLoading}
            onChange={onSettingsChange}
            align="right"
          />

          {showSend ? (
            <button
              type="submit"
              disabled={disabled || isLoading}
              aria-label="Send message"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              aria-label={isListening ? "Stop listening" : "Start voice input"}
              onClick={toggleListening}
              disabled={disabled || isLoading}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition disabled:opacity-50 ${
                isListening
                  ? "text-red-500 hover:bg-red-50"
                  : "text-zinc-500 hover:bg-black/[0.04] hover:text-zinc-800"
              }`}
            >
              {isListening ? (
                <MicOff className="h-5 w-5" />
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </button>
          )}
        </form>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        className="hidden"
        onChange={handleFileSelect}
      />
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
    </div>
  );
}
