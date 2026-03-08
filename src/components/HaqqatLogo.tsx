interface HaqqatLogoProps {
  size?: number;
  className?: string;
}

export default function HaqqatLogo({ size = 24, className = "" }: HaqqatLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* H lettermark with upward arrow */}
      <rect x="120" y="140" width="70" height="280" rx="8" fill="currentColor" />
      <rect x="190" y="250" width="90" height="60" rx="6" fill="currentColor" />
      <rect x="280" y="200" width="70" height="220" rx="8" fill="currentColor" />
      {/* Arrow head on right pillar */}
      <path
        d="M315 200 L355 140 L395 200 L360 200 L360 200 L350 200Z"
        fill="currentColor"
      />
      <polygon points="315,210 355,130 395,210" fill="currentColor" />
      <rect x="330" y="200" width="50" height="220" rx="8" fill="currentColor" />
    </svg>
  );
}
