"use client";

import {
  MoreHorizontal,
  Pencil,
  Plus,
  SquarePen,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { ChromaLogo } from "@/components/chroma-logo";
import { DropdownItem, DropdownMenu } from "@/components/dropdown-menu";
import type { ChatSession } from "@/lib/types";

type SidebarProps = {
  open: boolean;
  collapsed: boolean;
  sessions: ChatSession[];
  activeChatId: string | null;
  onClose: () => void;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
};

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return new Date(timestamp).toLocaleDateString();
}

function RelativeTime({ timestamp }: { timestamp: number }) {
  return (
    <p className="mt-0.5 text-xs text-zinc-400">
      {formatRelativeTime(timestamp)}
    </p>
  );
}

function ChatListItem({
  session,
  isActive,
  onSelect,
  onRename,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftTitle, setDraftTitle] = useState(session.title);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commitRename() {
    const next = draftTitle.trim() || "New chat";
    onRename(next);
    setDraftTitle(next);
    setIsEditing(false);
    setMenuOpen(false);
  }

  return (
    <div
      className={`group relative flex items-center gap-1 rounded-xl px-2 py-1.5 transition ${
        isActive ? "bg-black/[0.05]" : "hover:bg-black/[0.03]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 px-1 py-1.5 text-left"
      >
        {isEditing ? (
          <input
            ref={inputRef}
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.target.value)}
            onBlur={commitRename}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") {
                setDraftTitle(session.title);
                setIsEditing(false);
              }
            }}
            className="w-full rounded-lg bg-black/[0.04] px-2 py-1 text-sm outline-none focus:bg-black/[0.06]"
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <>
            <p
              className={`truncate text-sm ${
                isActive ? "font-medium text-zinc-900" : "text-zinc-700"
              }`}
            >
              {session.title}
            </p>
            <RelativeTime timestamp={session.updatedAt} />
          </>
        )}
      </button>

      {!isEditing && (
        <div className="relative shrink-0">
          <button
            type="button"
            aria-label="Chat options"
            onClick={() => setMenuOpen((value) => !value)}
            className="rounded-lg p-1.5 text-zinc-400 opacity-0 transition hover:bg-white hover:text-zinc-700 group-hover:opacity-100 data-[open=true]:opacity-100"
            data-open={menuOpen}
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <DropdownMenu open={menuOpen} onClose={() => setMenuOpen(false)}>
            <DropdownItem
              onClick={() => {
                setDraftTitle(session.title);
                setIsEditing(true);
                setMenuOpen(false);
              }}
            >
              <Pencil className="mr-2 inline h-3.5 w-3.5" />
              Rename
            </DropdownItem>
            <DropdownItem
              destructive
              onClick={() => {
                onDelete();
                setMenuOpen(false);
              }}
            >
              <Trash2 className="mr-2 inline h-3.5 w-3.5" />
              Delete
            </DropdownItem>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}

export function Sidebar({
  open,
  collapsed,
  sessions,
  activeChatId,
  onClose,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
}: SidebarProps) {
  const sortedSessions = [...sessions].sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );

  const widthClass = collapsed
    ? "w-[68px] md:w-[68px]"
    : "w-[min(88vw,280px)] md:w-[280px]";

  return (
    <>
      {open && !collapsed && (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-[#f5f5f5]/90 backdrop-blur-xl transition-[width,transform] duration-200 md:static md:z-0 md:translate-x-0 ${widthClass} ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div
          className={`flex items-center ${collapsed ? "justify-center px-2 py-4" : "px-4 py-4"}`}
        >
          {!collapsed && <ChromaLogo size="md" showWordmark />}
          {collapsed && <ChromaLogo size="sm" />}
        </div>

        <div className={`px-3 pb-2 ${collapsed ? "flex justify-center" : ""}`}>
          <button
            type="button"
            onClick={onNewChat}
            aria-label="New chat"
            title="New chat"
            className={`flex items-center justify-center rounded-xl text-sm font-medium text-zinc-700 transition hover:bg-black/[0.04] hover:text-zinc-900 ${
              collapsed ? "h-10 w-10" : "w-full gap-2 px-4 py-2.5"
            }`}
          >
            {collapsed ? (
              <Plus className="h-5 w-5" />
            ) : (
              <>
                <SquarePen className="h-4 w-4" />
                New chat
              </>
            )}
          </button>
        </div>

        {!collapsed && (
          <div className="chroma-scroll flex-1 overflow-y-auto px-3 pb-4">
            <p className="mb-2 px-2 text-[11px] font-medium tracking-wide text-zinc-400">
              Recent
            </p>

            {sortedSessions.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-zinc-400">
                No chats yet
              </p>
            ) : (
              <div className="space-y-0.5">
                {sortedSessions.map((session) => (
                  <ChatListItem
                    key={session.id}
                    session={session}
                    isActive={session.id === activeChatId}
                    onSelect={() => {
                      onSelectChat(session.id);
                      onClose();
                    }}
                    onRename={(title) => onRenameChat(session.id, title)}
                    onDelete={() => onDeleteChat(session.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!collapsed && (
          <p className="mt-auto px-4 pb-4 text-[11px] text-zinc-400">
            Chats saved locally
          </p>
        )}
      </aside>
    </>
  );
}
