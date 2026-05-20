"use client";

type FollowUpSuggestionsProps = {
  suggestions: string[];
  disabled?: boolean;
  onSelect: (question: string) => void;
};

export function FollowUpSuggestions({
  suggestions,
  disabled = false,
  onSelect,
}: FollowUpSuggestionsProps) {
  if (suggestions.length === 0) return null;

  return (
    <div className="mx-auto w-full max-w-3xl px-3 pb-1 sm:px-4">
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(suggestion)}
            className="rounded-full bg-black/[0.04] px-3 py-1.5 text-left text-sm text-zinc-600 transition hover:bg-black/[0.06] hover:text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
