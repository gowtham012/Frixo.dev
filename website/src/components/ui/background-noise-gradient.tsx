"use client";

import React, { useRef, useEffect } from "react";

/** Inline Noise overlay using canvas. */
interface NoiseProps {
  patternSize?: number;
  patternScaleX?: number;
  patternScaleY?: number;
  patternRefreshInterval?: number;
  patternAlpha?: number; // 0–255
}

const Noise: React.FC<NoiseProps> = ({
  patternSize = 250,
  patternScaleX = 1,
  patternScaleY = 1,
  patternRefreshInterval = 2,
  patternAlpha = 15,
}) => {
  const grainRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = grainRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let frame = 0;
    let animationId = 0;
    const canvasSize = 1024;

    const resize = () => {
      if (!canvas) return;
      canvas.width = canvasSize;
      canvas.height = canvasSize;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
    };

    const drawGrain = () => {
      const imageData = ctx.createImageData(canvasSize, canvasSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = patternAlpha;
      }
      ctx.putImageData(imageData, 0, 0);
    };

    const loop = () => {
      if (frame % patternRefreshInterval === 0) drawGrain();
      frame++;
      animationId = window.requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);
    resize();
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationId);
    };
  }, [patternSize, patternScaleX, patternScaleY, patternRefreshInterval, patternAlpha]);

  return (
    <canvas
      ref={grainRef}
      className="pointer-events-none absolute inset-0"
      style={{ imageRendering: "pixelated" }}
    />
  );
};

interface BackgroundNoiseGradientProps {
  className?: string;
  /** Primary gradient color - defaults to theme orange #FB631B */
  gradientColor?: string;
  /** Secondary gradient color - defaults to theme cyan #00F0FF */
  secondaryColor?: string;
  /** Noise pattern alpha (0-255) */
  noiseAlpha?: number;
  /** Noise refresh interval (frames) */
  noiseRefreshInterval?: number;
}

export function BackgroundNoiseGradient({
  className = "",
  gradientColor = "#FB631B",
  secondaryColor = "#00F0FF",
  noiseAlpha = 18,
  noiseRefreshInterval = 2,
}: BackgroundNoiseGradientProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Base dark background */}
      <div className="absolute inset-0 bg-[#0F0F12]" />

      {/* Primary radial spotlight (orange) - centered top */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 600px at 50% 200px, ${gradientColor}40, transparent)`,
        }}
      />

      {/* Secondary radial glow (cyan) - offset */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 500px at 30% 300px, ${secondaryColor}25, transparent)`,
        }}
      />

      {/* Tertiary subtle glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle 400px at 70% 400px, ${gradientColor}20, transparent)`,
        }}
      />

      {/* Grain overlay */}
      <Noise patternRefreshInterval={noiseRefreshInterval} patternAlpha={noiseAlpha} />
    </div>
  );
}

export default BackgroundNoiseGradient;
