"use client";

import { useEffect, useRef, useCallback } from "react";

interface Point {
  x: number;
  y: number;
  vx: number;
  vy: number;
  age: number;
  size: number;
}

export function FluidCursor({ className = "" }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, isInside: false });
  const animationRef = useRef<number | null>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  // Theme colors - Cyan #00F0FF to Orange #FB631B
  const colors = {
    cyan: { r: 0, g: 240, b: 255 },    // #00F0FF
    orange: { r: 251, g: 99, b: 27 },   // #FB631B
  };

  // Simplex noise approximation for organic movement
  const noise = useCallback((x: number, y: number, t: number) => {
    const sin1 = Math.sin(x * 0.01 + t);
    const sin2 = Math.sin(y * 0.01 + t * 0.8);
    const sin3 = Math.sin((x + y) * 0.005 + t * 1.2);
    return (sin1 + sin2 + sin3) / 3;
  }, []);

  // Interpolate between cyan and orange based on value (0-1)
  const getGradientColor = useCallback((t: number, alpha: number) => {
    const r = colors.cyan.r + (colors.orange.r - colors.cyan.r) * t;
    const g = colors.cyan.g + (colors.orange.g - colors.cyan.g) * t;
    const b = colors.cyan.b + (colors.orange.b - colors.cyan.b) * t;
    return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
  }, [colors]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      sizeRef.current = { width: rect.width, height: rect.height };

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();

      // Check if mouse is inside the container
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouseRef.current.isInside =
        x >= 0 && x <= rect.width &&
        y >= 0 && y <= rect.height;

      mouseRef.current.prevX = mouseRef.current.x;
      mouseRef.current.prevY = mouseRef.current.y;
      mouseRef.current.x = x;
      mouseRef.current.y = y;

      // Only add points if mouse is inside
      if (!mouseRef.current.isInside) return;

      const vx = mouseRef.current.x - mouseRef.current.prevX;
      const vy = mouseRef.current.y - mouseRef.current.prevY;
      const speed = Math.sqrt(vx * vx + vy * vy);

      if (speed > 1) {
        const numPoints = Math.min(Math.floor(speed / 3), 5);
        for (let i = 0; i < numPoints; i++) {
          const t = i / numPoints;
          pointsRef.current.push({
            x: mouseRef.current.prevX + vx * t + (Math.random() - 0.5) * 20,
            y: mouseRef.current.prevY + vy * t + (Math.random() - 0.5) * 20,
            vx: vx * 0.2 + (Math.random() - 0.5) * 2,
            vy: vy * 0.2 + (Math.random() - 0.5) * 2,
            age: 0,
            size: 30 + Math.random() * 50,
          });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016;
      const { width, height } = sizeRef.current;

      // Fade out previous frame (creates trail effect)
      ctx.fillStyle = "rgba(15, 15, 18, 0.05)";
      ctx.fillRect(0, 0, width, height);

      const points = pointsRef.current;
      for (let i = points.length - 1; i >= 0; i--) {
        const p = points[i];

        // Apply noise-based movement (FBM-like)
        const n = noise(p.x, p.y, time);
        p.vx += n * 0.5;
        p.vy += noise(p.y, p.x, time + 100) * 0.5;

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;

        p.age += 0.008;

        if (p.age > 1) {
          points.splice(i, 1);
          continue;
        }

        const alpha = (1 - p.age) * 0.7;
        const size = p.size * (1 - p.age * 0.3);
        // Bias towards cyan (0 = cyan, 1 = orange). Using pow to keep it more cyan
        const colorT = Math.pow((Math.sin(p.age * Math.PI * 0.5 + n * 0.5) + 1) / 2, 2);

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size);
        gradient.addColorStop(0, getGradientColor(colorT, alpha));
        gradient.addColorStop(0.4, getGradientColor(colorT, alpha * 0.6));
        gradient.addColorStop(1, getGradientColor(colorT, 0));

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      if (points.length > 300) {
        points.splice(0, points.length - 300);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [noise, getGradientColor]);

  return (
    <div ref={containerRef} className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ filter: "blur(25px)" }}
      />
    </div>
  );
}
