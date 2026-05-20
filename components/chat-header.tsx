"use client";

import { PanelLeft } from "lucide-react";

type ChatHeaderProps = {
  onToggleSidebar: () => void;
};

export function ChatHeader({ onToggleSidebar }: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-20 shrink-0 bg-[var(--background)]/70 backdrop-blur-xl">
      <div className="flex h-12 items-center px-3 sm:px-4">
        <button
          type="button"
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="-ml-1 rounded-lg p-2 text-zinc-500 transition hover:bg-black/[0.04] hover:text-zinc-800"
        >
          <PanelLeft className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
}
