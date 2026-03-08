import haqqatLogo from "@/assets/haqqat-logo.png";

interface HaqqatLogoProps {
  size?: number;
  className?: string;
}

export default function HaqqatLogo({ size = 24, className = "" }: HaqqatLogoProps) {
  return (
    <img
      src={haqqatLogo}
      alt="Haqqat logo"
      width={size}
      height={size}
      className={`brightness-0 invert-0 dark:invert hue-rotate-0 sepia saturate-[10] ${className}`}
      style={{
        filter: "brightness(0) sepia(1) saturate(5) hue-rotate(var(--logo-hue, 30deg))",
      }}
    />
  );
}
