"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface GradientCursorProps {
  className?: string;
}

export function GradientCursor({ className = "" }: GradientCursorProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Smooth spring animation for mouse following
  const springConfig = { damping: 25, stiffness: 150, mass: 0.5 };
  const mouseXSpring = useSpring(0, springConfig);
  const mouseYSpring = useSpring(0, springConfig);

  // Secondary blob with slower follow
  const springConfigSlow = { damping: 35, stiffness: 100, mass: 1 };
  const mouseXSpringSlow = useSpring(0, springConfigSlow);
  const mouseYSpringSlow = useSpring(0, springConfigSlow);

  // Third blob even slower
  const springConfigSlowest = { damping: 45, stiffness: 50, mass: 1.5 };
  const mouseXSpringSlowest = useSpring(0, springConfigSlowest);
  const mouseYSpringSlowest = useSpring(0, springConfigSlowest);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setMousePosition({ x, y });
        mouseXSpring.set(x);
        mouseYSpring.set(y);
        mouseXSpringSlow.set(x);
        mouseYSpringSlow.set(y);
        mouseXSpringSlowest.set(x);
        mouseYSpringSlowest.set(y);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseXSpring, mouseYSpring, mouseXSpringSlow, mouseYSpringSlow, mouseXSpringSlowest, mouseYSpringSlowest]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
    >
      {/* Main cyan blob - fastest */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          x: useTransform(mouseXSpring, (x) => x - 250),
          y: useTransform(mouseYSpring, (y) => y - 250),
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.4) 0%, rgba(0, 240, 255, 0.1) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Orange blob - medium speed */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          x: useTransform(mouseXSpringSlow, (x) => x - 200),
          y: useTransform(mouseYSpringSlow, (y) => y - 200),
          background: "radial-gradient(circle, rgba(251, 99, 27, 0.35) 0%, rgba(251, 99, 27, 0.1) 40%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Mixed gradient blob - slowest, creates trailing effect */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          x: useTransform(mouseXSpringSlowest, (x) => x - 300),
          y: useTransform(mouseYSpringSlowest, (y) => y - 300),
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.2) 0%, rgba(251, 99, 27, 0.15) 30%, transparent 60%)",
          filter: "blur(100px)",
        }}
      />

      {/* Subtle green accent */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full"
        style={{
          x: useTransform(mouseXSpringSlow, (x) => x - 150 + 100),
          y: useTransform(mouseYSpringSlow, (y) => y - 150 - 50),
          background: "radial-gradient(circle, rgba(0, 255, 148, 0.2) 0%, transparent 60%)",
          filter: "blur(70px)",
        }}
      />

      {/* Core bright spot */}
      <motion.div
        className="absolute w-[200px] h-[200px] rounded-full"
        style={{
          x: useTransform(mouseXSpring, (x) => x - 100),
          y: useTransform(mouseYSpring, (y) => y - 100),
          background: "radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 50%)",
          filter: "blur(30px)",
        }}
      />
    </div>
  );
}
