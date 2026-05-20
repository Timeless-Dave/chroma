"use client";

import { useEffect, useRef } from "react";

type DropdownMenuProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  align?: "left" | "right";
};

export function DropdownMenu({
  open,
  onClose,
  children,
  align = "right",
}: DropdownMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleClick(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={`absolute top-full z-50 mt-1 min-w-[140px] overflow-hidden rounded-xl bg-white/95 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-xl ${
        align === "right" ? "right-0" : "left-0"
      }`}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  onClick,
  destructive = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-black/[0.04] ${
        destructive ? "text-red-600" : "text-zinc-700"
      }`}
    >
      {children}
    </button>
  );
}
