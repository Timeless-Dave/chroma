export function LoadingDots() {
  return (
    <span
      className="inline-flex items-center gap-1.5 py-0.5"
      aria-label="Assistant is typing"
    >
      <span className="chroma-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
      <span className="chroma-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
      <span className="chroma-dot h-1.5 w-1.5 rounded-full bg-zinc-400" />
    </span>
  );
}
