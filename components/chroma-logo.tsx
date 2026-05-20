type ChromaMarkProps = {
  size: number;
  showBackground?: boolean;
  variant?: "default" | "spinner";
};

function ChromaMark({
  size,
  showBackground = true,
  variant = "default",
}: ChromaMarkProps) {
  const radius = size * 0.22;
  const stroke = size * 0.11;
  const center = size / 2;
  const arcRadius = size * 0.27;
  const dotRadius = size * 0.05;
  const gradientId = `chroma-ui-${size}-${showBackground ? "bg" : "plain"}-${variant}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      {showBackground && (
        <rect width={size} height={size} rx={radius} fill="#111114" />
      )}
      <defs>
        <linearGradient
          id={gradientId}
          x1={center * 0.35}
          y1={center * 0.35}
          x2={size - center * 0.35}
          y2={size - center * 0.35}
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8B5CF6" />
          <stop offset="0.5" stopColor="#D946EF" />
          <stop offset="1" stopColor="#FB923C" />
        </linearGradient>
      </defs>
      <g
        className={variant === "spinner" ? "chroma-spinner-arc" : undefined}
      >
        <path
          d={`M${center + arcRadius * 0.85} ${center - arcRadius * 0.65} a ${arcRadius} ${arcRadius} 0 1 0 -${arcRadius * 0.04} ${arcRadius * 1.3}`}
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
        />
        {variant === "default" && (
          <circle
            cx={center + arcRadius * 0.88}
            cy={center - arcRadius * 0.68}
            r={dotRadius}
            fill="#FDE68A"
          />
        )}
      </g>
    </svg>
  );
}

type ChromaLogoProps = {
  size?: "sm" | "md" | "lg";
  showWordmark?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

const sizes = {
  sm: { mark: 32, wordmarkHeight: 22 },
  md: { mark: 36, wordmarkHeight: 26 },
  lg: { mark: 56, wordmarkHeight: 40 },
} as const;

export function ChromaSpinner({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      aria-label="Chroma is thinking"
      role="status"
    >
      <ChromaMark size={size} showBackground={false} variant="spinner" />
    </div>
  );
}

export function ChromaLogo({
  size = "md",
  showWordmark = false,
  variant = "light",
  className = "",
}: ChromaLogoProps) {
  const { mark, wordmarkHeight } = sizes[size];
  const textColor = variant === "dark" ? "#FAFAFA" : "#18181B";

  if (!showWordmark) {
    return (
      <div className={className}>
        <ChromaMark size={mark} />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <ChromaMark size={mark} />
      <span
        className="font-semibold tracking-tight"
        style={{
          color: textColor,
          fontSize: wordmarkHeight,
          lineHeight: 1,
        }}
      >
        Chroma
      </span>
    </div>
  );
}

export function ChromaLogoImage({
  variant = "light",
  className = "",
}: {
  variant?: "light" | "dark";
  className?: string;
}) {
  const src =
    variant === "dark"
      ? "/brand/chroma-logo-dark.svg"
      : "/brand/chroma-logo.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Chroma" className={className} />
  );
}
