"use client";

interface WaveDividerProps {
  variant?: "top" | "bottom";
  color?: "cream" | "forest" | "forest-secondary";
  flip?: boolean;
  className?: string;
}

export function WaveDivider({ 
  variant = "top", 
  color = "cream", 
  flip = false,
  className = "" 
}: WaveDividerProps) {
  const colorMap = {
    cream: "#F5F0E8",
    forest: "#0D2B1F",
    "forest-secondary": "#122E22",
  };

  const fillColor = colorMap[color];

  const topWave = (
    <svg
      className={`w-full h-auto block ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 120L48 108C96 96 192 72 288 66C384 60 480 72 576 78C672 84 768 84 864 78C960 72 1056 60 1152 60C1248 60 1344 72 1392 78L1440 84V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z"
        fill={fillColor}
      />
    </svg>
  );

  const bottomWave = (
    <svg
      className={`w-full h-auto block ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 0L48 12C96 24 192 48 288 54C384 60 480 48 576 42C672 36 768 36 864 42C960 48 1056 60 1152 60C1248 60 1344 48 1392 42L1440 36V0H1392C1344 0 1248 0 1152 0C1056 0 960 0 864 0C768 0 672 0 576 0C480 0 384 0 288 0C192 0 96 0 48 0H0Z"
        fill={fillColor}
      />
    </svg>
  );

  const organicWave = (
    <svg
      className={`w-full h-auto block ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 100C240 100 240 40 480 40C720 40 720 80 960 80C1200 80 1200 20 1440 20V100H0Z"
        fill={fillColor}
      />
    </svg>
  );

  return variant === "top" ? topWave : bottomWave;
}

export function OrganicDivider({ 
  color = "cream",
  flip = false,
  className = "" 
}: Omit<WaveDividerProps, "variant">) {
  const colorMap = {
    cream: "#F5F0E8",
    forest: "#0D2B1F",
    "forest-secondary": "#122E22",
  };

  const fillColor = colorMap[color];

  return (
    <svg
      className={`w-full h-auto block ${flip ? "rotate-180" : ""} ${className}`}
      viewBox="0 0 1440 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
    >
      <path
        d="M0 80C180 80 180 30 360 30C540 30 540 60 720 60C900 60 900 20 1080 20C1260 20 1260 50 1440 50V80H0Z"
        fill={fillColor}
      />
    </svg>
  );
}
