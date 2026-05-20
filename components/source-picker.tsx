"use client";

import { BookOpen, ChevronDown, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { KNOWLEDGE_BASES } from "@/lib/knowledge-bases";
import type { AppSettings, SourceMode } from "@/lib/types";

type SourcePickerProps = {
  settings: AppSettings;
  disabled?: boolean;
  onChange: (settings: AppSettings) => void;
  align?: "left" | "right";
};

export function SourcePicker({
  settings,
  disabled = false,
  onChange,
  align = "left",
}: SourcePickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const knowledgeBase = KNOWLEDGE_BASES.find(
    (base) => base.id === settings.knowledgeBaseId,
  );

  const label =
    settings.sourceMode === "web"
      ? "Web"
      : knowledgeBase?.name ?? "Knowledge";

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  function updateSourceMode(sourceMode: SourceMode) {
    onChange({ ...settings, sourceMode });
  }

  function updateKnowledgeBase(knowledgeBaseId: string) {
    onChange({ ...settings, knowledgeBaseId, sourceMode: "knowledge" });
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex max-w-[min(34vw,160px)] shrink-0 items-center gap-1 rounded-full px-2 py-1.5 text-xs text-zinc-500 transition hover:bg-black/[0.04] hover:text-zinc-700 disabled:opacity-50 sm:max-w-[180px]"
      >
        {settings.sourceMode === "web" ? (
          <Globe className="hidden h-3.5 w-3.5 shrink-0 sm:block" />
        ) : (
          <BookOpen className="hidden h-3.5 w-3.5 shrink-0 sm:block" />
        )}
        <span className="truncate">{label}</span>
        <ChevronDown
          className={`h-3 w-3 shrink-0 opacity-50 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="menu"
          className={`absolute bottom-full z-50 mb-2 w-[min(88vw,260px)] overflow-hidden rounded-2xl bg-white/95 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <p className="px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
            Source
          </p>

          {(
            [
              { id: "knowledge" as SourceMode, label: "Knowledge", icon: BookOpen },
              { id: "web" as SourceMode, label: "Web", icon: Globe },
            ] as const
          ).map((mode) => {
            const Icon = mode.icon;
            const active = settings.sourceMode === mode.id;

            return (
              <button
                key={mode.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => updateSourceMode(mode.id)}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-700 hover:bg-black/[0.04]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-80" />
                {mode.label}
              </button>
            );
          })}

          {settings.sourceMode === "knowledge" && (
            <>
              <p className="mt-1 px-2.5 py-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Brain
              </p>
              {KNOWLEDGE_BASES.map((base) => {
                const active = settings.knowledgeBaseId === base.id;

                return (
                  <button
                    key={base.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={active}
                    onClick={() => updateKnowledgeBase(base.id)}
                    className={`flex w-full flex-col rounded-xl px-2.5 py-2 text-left transition ${
                      active
                        ? "bg-zinc-100 text-zinc-900"
                        : "text-zinc-700 hover:bg-black/[0.04]"
                    }`}
                  >
                    <span className="text-sm">{base.name}</span>
                    <span className="mt-0.5 text-xs text-zinc-500">
                      {base.description}
                    </span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
