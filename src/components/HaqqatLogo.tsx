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
      className={className}
    />
  );
}
