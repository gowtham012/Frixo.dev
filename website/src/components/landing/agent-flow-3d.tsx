"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

// ============================================
// TYPES
// ============================================
interface Step {
  type: "user" | "agent" | "system" | "action" | "evolution" | "approval" | "email" | "monitor";
  content: string;
  subtext?: string;
  provider?: string;
  status?: "loading" | "success" | "warning" | "error" | "pending";
  diagnosis?: string;
  fix?: string;
  // Email notification fields
  emailSubject?: string;
  emailPreview?: string;
}

interface Demo {
  id: string;
  label: string;
  description: string;
  icon: string;
  steps: Step[];
  metrics: { value: string; unit: string; label: string }[];
}

// ============================================
// DEMO DATA - Two Scenarios: Build & Production Evolution
// ============================================
const demos: Demo[] = [
  // DEMO 1: First Time Build - Building a new agent from scratch
  {
    id: "build",
    label: "Build Agent",
    description: "First-time build",
    icon: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z",
    steps: [
      { type: "user", content: "Build a LinkedIn agent that posts AI updates daily at 9 AM" },
      { type: "agent", content: "Configuring content agent", subtext: "Tone: thought-leadership | Schedule: 9 AM EST" },
      { type: "action", content: "Connect LinkedIn", provider: "linkedin" },
      { type: "system", content: "OAuth tokens secured", status: "success" },
      { type: "system", content: "Content pipeline built", status: "success" },
      { type: "system", content: "Running 24 eval scenarios", status: "loading" },
      { type: "system", content: "22/24 passed - 2 edge cases", status: "warning" },
      { type: "evolution", content: "Auto-fixing detected issue", diagnosis: "Posts exceeding 3000 char limit", fix: "Added smart truncation with summarization" },
      { type: "system", content: "24/24 evals passed", status: "success" },
      { type: "system", content: "Deploying to edge", status: "loading" },
      { type: "agent", content: "Agent deployed", subtext: "Monitoring active | First post: tomorrow 9 AM" },
    ],
    metrics: [
      { value: "24", unit: "", label: "Evals passed" },
      { value: "Auto", unit: "", label: "Self-healing" },
    ],
  },
  // DEMO 2: Production Evolution - Already deployed agent detecting anomalies
  {
    id: "production",
    label: "Production",
    description: "Deployed agent evolution",
    icon: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
    steps: [
      // Agent is running in production
      { type: "monitor", content: "LinkedIn Content Agent", subtext: "Status: Running | Uptime: 14 days | Posts: 47" },
      { type: "system", content: "Monitoring 847 executions/day", status: "success" },
      { type: "system", content: "Anomaly detected in API response", status: "warning" },
      // Platform analyzes and diagnoses
      { type: "evolution", content: "Analyzing anomaly", diagnosis: "LinkedIn API rate limit reached (100/day)", fix: "Implement request queuing with exponential backoff" },
      // Email notification sent to user
      {
        type: "email",
        content: "Email notification sent",
        emailSubject: "🔔 Action Required: LinkedIn Agent Fix",
        emailPreview: "Your LinkedIn Content Agent detected a rate limit issue. We've prepared a fix that adds request queuing. Review and approve to apply."
      },
      // Waiting for approval
      { type: "approval", content: "Awaiting your approval", status: "pending" },
      // After approval
      { type: "system", content: "Fix approved via email", status: "success" },
      { type: "system", content: "Applying fix to production", status: "loading" },
      { type: "system", content: "Running regression tests", status: "loading" },
      { type: "system", content: "All tests passed", status: "success" },
      { type: "agent", content: "Agent updated & running", subtext: "Version: 1.0.4 | Fix applied successfully" },
    ],
    metrics: [
      { value: "14", unit: "days", label: "Uptime" },
      { value: "47", unit: "", label: "Posts made" },
      { value: "1", unit: "", label: "Auto-fix applied" },
    ],
  },
];

// Provider button styles
const providers: Record<string, { bg: string; icon: string }> = {
  linkedin: {
    bg: "bg-[#0A66C2]",
    icon: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
  },
  notion: {
    bg: "bg-white",
    icon: "M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.934z"
  },
  slack: {
    bg: "bg-[#4A154B]",
    icon: "M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313z"
  },
};

// ============================================
// CIRCUIT GRID BACKGROUND
// ============================================
function CircuitGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-20">
      <svg width="100%" height="100%" className="absolute inset-0">
        <defs>
          <pattern id="circuit" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <path
              d="M30 0 L30 20 M30 40 L30 60 M0 30 L20 30 M40 30 L60 30"
              className="stroke-accent-cyan"
              strokeWidth="0.5"
              fill="none"
              opacity="0.3"
            />
            <circle cx="30" cy="30" r="2" className="fill-accent-cyan" opacity="0.2" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
      {/* Animated pulse nodes */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-accent-cyan shadow-[0_0_10px_theme(colors.accent.cyan)]"
          style={{
            left: `${20 + i * 15}%`,
            top: `${30 + (i % 3) * 20}%`,
          }}
          animate={{
            opacity: [0.2, 1, 0.2],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            delay: i * 0.4,
            repeat: Infinity,
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// APPROVAL BUTTON COMPONENT
// ============================================
function ApprovalButton({ onApprove, status }: { onApprove: () => void; status: "pending" | "approved" }) {
  if (status === "approved") {
    return (
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="nm-extruded-sm flex items-center gap-2 px-4 py-2 text-sm text-accent-green"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
        </svg>
        <span>Approved</span>
      </motion.div>
    );
  }

  return (
    <motion.button
      onClick={onApprove}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="btn-hybrid flex items-center gap-3 px-5 py-3 text-sm font-medium"
    >
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="w-2 h-2 rounded-full bg-accent-purple"
      />
      <span className="text-accent-purple">Approve Fix</span>
      <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </motion.button>
  );
}

// ============================================
// DEMO VISUALIZATION
// ============================================
function DemoVisualization({ demo, isActive }: { demo: Demo; isActive: boolean }) {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "paused" | "complete">("idle");
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved">("pending");
  const containerRef = useRef<HTMLDivElement>(null);
  const pausedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive) {
      setVisibleSteps(0);
      setPhase("idle");
      setApprovalStatus("pending");
      pausedAtRef.current = null;
      return;
    }

    setPhase("running");
    let step = 0;

    const runSteps = () => {
      const interval = setInterval(() => {
        if (step < demo.steps.length) {
          const currentStep = demo.steps[step];
          setVisibleSteps(step + 1);

          // Pause at approval step
          if (currentStep.type === "approval") {
            pausedAtRef.current = step;
            setPhase("paused");
            clearInterval(interval);

            // Auto-approve after 2 seconds for demo purposes
            setTimeout(() => {
              setApprovalStatus("approved");
              setTimeout(() => {
                setPhase("running");
                step++;
                runSteps();
              }, 500);
            }, 2000);
            return;
          }

          step++;
        } else {
          setPhase("complete");
          clearInterval(interval);
        }
      }, 900);

      return interval;
    };

    const interval = runSteps();
    return () => clearInterval(interval);
  }, [isActive, demo]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleSteps]);

  const isComplete = phase === "complete";
  const isPaused = phase === "paused";

  return (
    <div className="relative h-full flex flex-col nm-extruded overflow-hidden">
      {/* Glow effect - purple when paused for evolution */}
      <motion.div
        className="absolute -inset-px rounded-3xl pointer-events-none"
        style={{
          background: isPaused
            ? `radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.25), transparent 70%)`
            : `radial-gradient(ellipse at 50% 0%, rgba(0, 212, 255, 0.15), transparent 70%)`,
        }}
        animate={{ opacity: phase === "running" || isPaused ? 1 : 0.3 }}
      />

      {/* Header */}
      <div className="relative flex items-center justify-between px-5 py-4 border-b border-background-border">
        <div className="flex items-center gap-3">
          <div className={`nm-extruded-sm w-9 h-9 flex items-center justify-center relative overflow-hidden`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${demo.id === "production" ? "from-accent-green/20 to-accent-cyan/20" : "from-accent-cyan/20 to-accent-purple/20"}`} />
            <svg className={`w-4 h-4 relative z-10 ${demo.id === "production" ? "text-accent-green" : "text-accent-cyan"}`} fill="currentColor" viewBox="0 0 24 24">
              <path d={demo.icon} />
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{demo.label}</div>
            <div className="text-xs text-foreground-dim">
              {demo.id === "production" ? "Production Monitor" : "Agent Builder"}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${
              isComplete ? "bg-accent-green" : isPaused ? "bg-accent-purple" : demo.id === "production" ? "bg-accent-green" : "bg-accent-cyan"
            }`}
            animate={phase === "running" || isPaused ? {
              boxShadow: isPaused
                ? [`0 0 0px rgba(168, 85, 247, 0)`, `0 0 12px rgba(168, 85, 247, 1)`, `0 0 0px rgba(168, 85, 247, 0)`]
                : demo.id === "production"
                ? [`0 0 0px rgba(0, 255, 136, 0)`, `0 0 12px rgba(0, 255, 136, 1)`, `0 0 0px rgba(0, 255, 136, 0)`]
                : [`0 0 0px rgba(0, 212, 255, 0)`, `0 0 12px rgba(0, 212, 255, 1)`, `0 0 0px rgba(0, 212, 255, 0)`]
            } : {}}
            transition={{ duration: 1, repeat: phase === "running" || isPaused ? Infinity : 0 }}
          />
          <span className="text-xs text-foreground-dim">
            {isComplete
              ? (demo.id === "production" ? "Fixed & Running" : "Deployed")
              : isPaused
              ? "Awaiting Approval"
              : phase === "running"
              ? (demo.id === "production" ? "Monitoring" : "Building")
              : "Ready"}
          </span>
        </div>
      </div>

      {/* Chat-style content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence mode="popLayout">
          {demo.steps.slice(0, visibleSteps).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Monitor step - shows deployed agent status */}
              {step.type === "monitor" && (
                <div className="flex items-start gap-3">
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-accent-green"
                    />
                  </div>
                  {/* Message Bubble */}
                  <div className="flex-1 nm-inset-sm rounded-2xl rounded-tl-sm p-4 bg-accent-green/5 border border-accent-green/20">
                    <span className="text-accent-green font-medium text-sm">{step.content}</span>
                    {step.subtext && (
                      <div className="text-xs text-foreground-dim mt-1">{step.subtext}</div>
                    )}
                  </div>
                </div>
              )}

              {/* User message - Right aligned */}
              {step.type === "user" && (
                <div className="flex items-start gap-3 justify-end">
                  {/* Message Bubble */}
                  <div className="max-w-[85%] bg-accent-cyan/10 border border-accent-cyan/30 rounded-2xl rounded-tr-sm p-4">
                    <span className="text-foreground text-sm">{step.content}</span>
                  </div>
                  {/* User Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                </div>
              )}

              {/* Agent response - Left aligned */}
              {step.type === "agent" && (
                <div className="flex items-start gap-3">
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
                    </svg>
                  </div>
                  {/* Message Bubble */}
                  <div className="flex-1 nm-inset-sm rounded-2xl rounded-tl-sm p-4">
                    <span className="text-accent-cyan font-medium text-sm">{step.content}</span>
                    {step.subtext && (
                      <div className="text-xs text-foreground-dim mt-2">{step.subtext}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Action button - as agent message with button */}
              {step.type === "action" && step.provider && (
                <div className="flex items-start gap-3">
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
                    </svg>
                  </div>
                  {/* Message Bubble with action button */}
                  <div className="nm-inset-sm rounded-2xl rounded-tl-sm p-4">
                    <span className="text-foreground-muted text-sm mb-3 block">Connecting to your account...</span>
                    <button className={`${providers[step.provider]?.bg} px-4 py-2.5 rounded-xl text-white text-sm font-medium flex items-center gap-2 shadow-lg`}>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d={providers[step.provider]?.icon} />
                      </svg>
                      {step.content}
                    </button>
                  </div>
                </div>
              )}

              {/* System status - Centered small pill */}
              {step.type === "system" && (() => {
                // If this is a past step (not the latest visible one), convert loading to success
                const isPastStep = i < visibleSteps - 1;
                const effectiveStatus = (step.status === "loading" && isPastStep) ? "success" : step.status;
                const isCurrentlyLoading = step.status === "loading" && !isPastStep;

                return (
                  <div className="flex justify-center">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs ${
                      effectiveStatus === "success" ? "bg-accent-green/10 border border-accent-green/30" :
                      effectiveStatus === "warning" ? "bg-orange-500/10 border border-orange-500/30" :
                      effectiveStatus === "error" ? "bg-red-500/10 border border-red-500/30" :
                      "bg-accent-cyan/10 border border-accent-cyan/30"
                    }`}>
                      {/* Icon: checkmark for success, dot for others */}
                      {effectiveStatus === "success" ? (
                        <svg className="w-3 h-3 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <div
                          className={`w-2 h-2 rounded-full ${
                            effectiveStatus === "warning" ? "bg-orange-500" :
                            effectiveStatus === "error" ? "bg-red-500" : "bg-accent-cyan"
                          }`}
                        />
                      )}
                      <span className={
                        effectiveStatus === "success" ? "text-accent-green" :
                        effectiveStatus === "warning" ? "text-orange-400" :
                        effectiveStatus === "error" ? "text-red-400" : "text-accent-cyan"
                      }>
                        {step.content}
                      </span>
                      {isCurrentlyLoading && (
                        <motion.div
                          className="w-3 h-3 border border-current border-t-transparent rounded-full"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Self-Evolution Block - as agent message */}
              {step.type === "evolution" && (
                <div className="flex items-start gap-3">
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <svg className="w-4 h-4 text-accent-purple" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
                      </svg>
                    </motion.div>
                  </div>
                  {/* Message Bubble */}
                  <div className="flex-1 nm-extruded-sm rounded-2xl rounded-tl-sm p-4 border-l-2 border-accent-purple/50">
                    <span className="text-accent-purple font-medium text-sm block mb-2">
                      {step.content}
                    </span>
                    {step.diagnosis && (
                      <div className="bg-background/50 rounded-lg p-3 mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-foreground-dim">Issue: </span>
                        <span className="text-xs text-foreground-muted">{step.diagnosis}</span>
                      </div>
                    )}
                    {step.fix && (
                      <div className="bg-accent-green/5 border border-accent-green/20 rounded-lg p-3">
                        <span className="text-[10px] uppercase tracking-wider text-accent-green">Fix: </span>
                        <span className="text-xs text-foreground">{step.fix}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Email Notification - as agent message */}
              {step.type === "email" && (
                <div className="flex items-start gap-3">
                  {/* Agent Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                    <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  {/* Email Card */}
                  <div className="flex-1 nm-extruded-sm rounded-2xl rounded-tl-sm overflow-hidden">
                    {/* Email Header */}
                    <div className="px-4 py-3 bg-background-elevated border-b border-background-border">
                      <div className="text-xs text-foreground-dim mb-1">From: platform@frixo.dev</div>
                      <div className="text-sm font-medium text-foreground">{step.emailSubject}</div>
                    </div>
                    {/* Email Body */}
                    <div className="px-4 py-3">
                      <p className="text-xs text-foreground-muted leading-relaxed mb-3">
                        {step.emailPreview}
                      </p>
                      <div className="flex items-center gap-2">
                        <motion.button
                          animate={{ scale: [1, 1.02, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="px-4 py-2 bg-accent-green text-background text-xs font-medium rounded-lg"
                        >
                          ✓ Approve Fix
                        </motion.button>
                        <button className="px-4 py-2 bg-background-elevated text-foreground-dim text-xs rounded-lg">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Approval - Centered confirmation */}
              {step.type === "approval" && (
                <div className="flex justify-center">
                  <ApprovalButton
                    onApprove={() => setApprovalStatus("approved")}
                    status={approvalStatus}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {phase === "running" && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-accent-cyan/30 to-accent-purple/30 flex items-center justify-center">
              <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
              </svg>
            </div>
            <div className="nm-inset-sm rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-1">
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent-cyan"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent-cyan"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                />
                <motion.div
                  className="w-2 h-2 rounded-full bg-accent-cyan"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Metrics bar - Only show after completion */}
      <div className="relative px-5 py-4 border-t border-background-border nm-inset">
        <AnimatePresence>
          {isComplete ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-between"
            >
              {demo.metrics.map((metric, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="flex items-baseline justify-center gap-0.5">
                    <span className="text-xl font-bold text-accent-cyan">
                      {metric.value}
                    </span>
                    {metric.unit && (
                      <span className="text-sm text-foreground-dim">{metric.unit}</span>
                    )}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-foreground-dim">
                    {metric.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-3 py-2"
            >
              <motion.div
                className={`w-4 h-4 border-2 rounded-full ${demo.id === "production" ? "border-accent-green/30 border-t-accent-green" : "border-accent-cyan/30 border-t-accent-cyan"}`}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <span className="text-xs text-foreground-dim">
                {demo.id === "production" ? "Processing..." : "Building agent..."}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================
// BEHIND THE SCENES - Infrastructure Operations
// ============================================

// Background operations that run in parallel for each step
interface BackgroundOp {
  service: string;
  action: string;
  status: "done" | "running" | "warn";
  delay: number; // ms delay before this appears
}

// For each frontend step index, define the background operations happening
// Different ops for Build vs Production demos
const getBuildOpsForStep = (stepIndex: number): BackgroundOp[] => {
  const buildOps: BackgroundOp[][] = [
    // Step 0: User input received
    [
      { service: "gateway", action: "Request received from client", status: "done", delay: 0 },
      { service: "auth", action: "Session validated: user_7x9k2", status: "done", delay: 40 },
      { service: "rate-limit", action: "Request quota checked: 847/1000", status: "done", delay: 80 },
      { service: "llm", action: "Loading claude-3-opus model", status: "running", delay: 120 },
      { service: "parser", action: "Tokenizing input: 14 tokens", status: "done", delay: 160 },
      { service: "context", action: "Building conversation context", status: "done", delay: 200 },
    ],
    // Step 1: Agent config generated
    [
      { service: "llm", action: "Inference complete: 847ms", status: "done", delay: 0 },
      { service: "schema", action: "Validating agent config schema", status: "done", delay: 40 },
      { service: "memory", action: "Allocating state: 2.4MB", status: "done", delay: 80 },
      { service: "registry", action: "Registering agent: agt_ln8x2p", status: "done", delay: 120 },
      { service: "namespace", action: "Creating isolated namespace", status: "done", delay: 160 },
      { service: "policy", action: "Applying default guardrails", status: "done", delay: 200 },
    ],
    // Step 2: OAuth connection initiated
    [
      { service: "secrets", action: "Fetching OAuth credentials", status: "done", delay: 0 },
      { service: "vault", action: "Decrypting client_secret", status: "done", delay: 40 },
      { service: "auth", action: "Verifying token scopes", status: "done", delay: 80 },
      { service: "tools", action: "Initializing LinkedIn SDK", status: "running", delay: 120 },
      { service: "network", action: "Opening secure connection", status: "running", delay: 160 },
    ],
    // Step 3: OAuth success
    [
      { service: "tools", action: "Connection established", status: "done", delay: 0 },
      { service: "audit", action: "Recording permission grant", status: "done", delay: 40 },
      { service: "token", action: "Storing refresh_token (encrypted)", status: "done", delay: 80 },
      { service: "health", action: "Connection health: HEALTHY", status: "done", delay: 120 },
    ],
    // Step 4: Pipeline configured
    [
      { service: "scheduler", action: "Configuring cron schedule", status: "done", delay: 0 },
      { service: "queue", action: "Creating job queue", status: "done", delay: 40 },
      { service: "worker", action: "Spawning worker process", status: "done", delay: 80 },
      { service: "cache", action: "Warming content cache", status: "done", delay: 120 },
    ],
    // Step 5: Running evals
    [
      { service: "eval", action: "Loading test fixtures", status: "done", delay: 0 },
      { service: "sandbox", action: "Spinning up isolated runtime", status: "done", delay: 40 },
      { service: "eval", action: "Executing scenario batch 1/4", status: "running", delay: 80 },
      { service: "eval", action: "Executing scenario batch 2/4", status: "running", delay: 120 },
      { service: "eval", action: "Executing scenario batch 3/4", status: "running", delay: 160 },
      { service: "eval", action: "Executing scenario batch 4/4", status: "running", delay: 200 },
    ],
    // Step 6: Eval issues detected
    [
      { service: "eval", action: "22/24 scenarios passed", status: "done", delay: 0 },
      { service: "eval", action: "2 edge cases detected", status: "warn", delay: 40 },
      { service: "trace", action: "Capturing failure context", status: "done", delay: 80 },
      { service: "analyzer", action: "Diagnosing root cause", status: "running", delay: 120 },
    ],
    // Step 7: Auto-fix applied
    [
      { service: "fix", action: "Generating fix proposal", status: "done", delay: 0 },
      { service: "config", action: "Applying automatic fix", status: "done", delay: 40 },
      { service: "version", action: "Creating revision: v1.0.1", status: "done", delay: 80 },
      { service: "eval", action: "Re-running failed scenarios", status: "running", delay: 120 },
    ],
    // Step 8: All evals passed
    [
      { service: "eval", action: "All scenarios: PASSED", status: "done", delay: 0 },
      { service: "metrics", action: "Avg latency: 234ms", status: "done", delay: 40 },
      { service: "report", action: "Generating eval report", status: "done", delay: 80 },
    ],
    // Step 9: Deploying
    [
      { service: "build", action: "Packaging agent bundle: 1.2MB", status: "done", delay: 0 },
      { service: "cdn", action: "Uploading to edge (3 regions)", status: "running", delay: 40 },
      { service: "health", action: "Running smoke tests", status: "running", delay: 80 },
      { service: "canary", action: "Canary deployment: 10% traffic", status: "running", delay: 120 },
    ],
    // Step 10: Deployed & live
    [
      { service: "deploy", action: "Agent live: us-east, eu-west, ap-south", status: "done", delay: 0 },
      { service: "traffic", action: "Routing 100% traffic", status: "done", delay: 40 },
      { service: "monitor", action: "Enabling real-time metrics", status: "done", delay: 80 },
      { service: "status", action: "Agent status: OPERATIONAL", status: "done", delay: 120 },
    ],
  ];

  return buildOps[stepIndex] || [
    { service: "system", action: "Processing step", status: "done", delay: 0 }
  ];
};

const getProductionOpsForStep = (stepIndex: number): BackgroundOp[] => {
  const productionOps: BackgroundOp[][] = [
    // Step 0: Monitor shows agent running
    [
      { service: "monitor", action: "Agent agt_ln8x2p running normally", status: "done", delay: 0 },
      { service: "metrics", action: "Uptime: 14d 6h 23m", status: "done", delay: 40 },
      { service: "stats", action: "Total executions: 847", status: "done", delay: 80 },
      { service: "health", action: "All dependencies healthy", status: "done", delay: 120 },
      { service: "trace", action: "Last execution: 2 min ago", status: "done", delay: 160 },
    ],
    // Step 1: Monitoring active
    [
      { service: "metrics", action: "Collecting execution metrics", status: "done", delay: 0 },
      { service: "alert", action: "Anomaly detection: active", status: "done", delay: 40 },
      { service: "baseline", action: "Comparing to baseline: OK", status: "done", delay: 80 },
    ],
    // Step 2: Anomaly detected
    [
      { service: "alert", action: "⚠️ ANOMALY DETECTED", status: "warn", delay: 0 },
      { service: "api", action: "LinkedIn API returned 429", status: "warn", delay: 40 },
      { service: "trace", action: "Capturing error context", status: "done", delay: 80 },
      { service: "log", action: "Error: Rate limit exceeded", status: "warn", delay: 120 },
      { service: "incident", action: "Creating incident report", status: "done", delay: 160 },
    ],
    // Step 3: Analyzing anomaly
    [
      { service: "analyzer", action: "Analyzing failure pattern", status: "done", delay: 0 },
      { service: "llm", action: "Diagnosing root cause", status: "running", delay: 40 },
      { service: "history", action: "Checking similar incidents", status: "done", delay: 80 },
      { service: "fix", action: "Generating fix proposal", status: "running", delay: 120 },
      { service: "test", action: "Simulating fix in sandbox", status: "running", delay: 160 },
      { service: "fix", action: "Fix validated: ready to apply", status: "done", delay: 200 },
    ],
    // Step 4: Email notification sent
    [
      { service: "notify", action: "Composing email notification", status: "done", delay: 0 },
      { service: "email", action: "Sending to user@example.com", status: "done", delay: 40 },
      { service: "webhook", action: "Triggering Slack notification", status: "done", delay: 80 },
      { service: "audit", action: "Recording notification sent", status: "done", delay: 120 },
    ],
    // Step 5: Awaiting approval
    [
      { service: "approval", action: "Waiting for user response", status: "running", delay: 0 },
      { service: "timeout", action: "Auto-escalation in: 4h", status: "done", delay: 40 },
      { service: "agent", action: "Operating in degraded mode", status: "warn", delay: 80 },
    ],
    // Step 6: Approved via email
    [
      { service: "approval", action: "✓ Fix approved by user", status: "done", delay: 0 },
      { service: "audit", action: "Recording approval: email link", status: "done", delay: 40 },
      { service: "deploy", action: "Initiating fix deployment", status: "running", delay: 80 },
    ],
    // Step 7: Applying fix
    [
      { service: "config", action: "Applying configuration change", status: "done", delay: 0 },
      { service: "version", action: "Creating revision: v1.0.4", status: "done", delay: 40 },
      { service: "backup", action: "Storing rollback point", status: "done", delay: 80 },
      { service: "deploy", action: "Hot-reloading agent", status: "running", delay: 120 },
    ],
    // Step 8: Running tests
    [
      { service: "test", action: "Running regression suite", status: "running", delay: 0 },
      { service: "eval", action: "Executing 24 scenarios", status: "running", delay: 40 },
      { service: "api", action: "Testing LinkedIn API calls", status: "running", delay: 80 },
      { service: "metrics", action: "Measuring response times", status: "running", delay: 120 },
    ],
    // Step 9: Tests passed
    [
      { service: "eval", action: "All scenarios: PASSED", status: "done", delay: 0 },
      { service: "verify", action: "Fix verified working", status: "done", delay: 40 },
      { service: "incident", action: "Closing incident report", status: "done", delay: 80 },
    ],
    // Step 10: Agent updated
    [
      { service: "deploy", action: "Agent v1.0.4 live", status: "done", delay: 0 },
      { service: "health", action: "All systems operational", status: "done", delay: 40 },
      { service: "notify", action: "Sending resolution email", status: "done", delay: 80 },
      { service: "learn", action: "Adding to knowledge base", status: "done", delay: 120 },
      { service: "status", action: "Agent status: OPERATIONAL", status: "done", delay: 160 },
    ],
  ];

  return productionOps[stepIndex] || [
    { service: "system", action: "Processing step", status: "done", delay: 0 }
  ];
};

const getBackgroundOpsForStep = (stepIndex: number, step: Step, demoId: string): BackgroundOp[] => {
  if (demoId === "production") {
    return getProductionOpsForStep(stepIndex);
  }
  return getBuildOpsForStep(stepIndex);
};

function BackgroundLogPanel({ visibleSteps, demo, isComplete }: { visibleSteps: number; demo: Demo; isComplete: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [displayedOps, setDisplayedOps] = useState<{stepIdx: number; ops: BackgroundOp[]}[]>([]);

  // Add new ops when visibleSteps changes
  useEffect(() => {
    if (visibleSteps === 0) {
      setDisplayedOps([]);
      return;
    }

    const stepIdx = visibleSteps - 1;
    const step = demo.steps[stepIdx];
    const newOps = getBackgroundOpsForStep(stepIdx, step, demo.id);

    // Add ops with staggered timing
    newOps.forEach((op, i) => {
      setTimeout(() => {
        setDisplayedOps(prev => {
          // Check if this op already exists
          const existing = prev.find(p => p.stepIdx === stepIdx);
          if (existing) {
            if (existing.ops.find(o => o.action === op.action)) return prev;
            return prev.map(p =>
              p.stepIdx === stepIdx
                ? { ...p, ops: [...p.ops, op] }
                : p
            );
          }
          return [...prev, { stepIdx, ops: [op] }];
        });
      }, op.delay);
    });
  }, [visibleSteps, demo.steps]);

  // Reset on demo change
  useEffect(() => {
    setDisplayedOps([]);
  }, [demo.id]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedOps]);

  // Flatten ops for display
  const allOps = displayedOps.flatMap(d => d.ops);
  let timeCounter = 0;

  return (
    <div className="h-full nm-extruded overflow-hidden flex flex-col font-mono text-[11px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-background-border">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent-purple/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-sm bg-accent-purple" />
          </div>
          <span className="text-sm font-medium text-foreground font-sans">
            {demo.id === "production" ? "Infrastructure Logs" : "System Logs"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${isComplete ? "bg-accent-green" : "bg-accent-cyan"}`}
            animate={!isComplete ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-foreground-dim font-sans text-xs">{isComplete ? "Complete" : "Running"}</span>
        </div>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-3 space-y-0.5"
        style={{ scrollbarWidth: "none" }}
      >
        <AnimatePresence mode="popLayout">
          {allOps.map((op, i) => {
            const time = `${String(Math.floor(timeCounter / 60)).padStart(2, "0")}:${String(timeCounter % 60).padStart(2, "0")}`;
            timeCounter += 2;
            return (
              <motion.div
                key={`${op.service}-${op.action}-${i}`}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
                className="flex items-start gap-1.5 py-0.5 leading-tight"
              >
                <span className="text-foreground-dim/60 shrink-0 w-10">{time}</span>
                <span className={`shrink-0 w-3 ${
                  op.status === "done" ? "text-accent-green" :
                  op.status === "warn" ? "text-orange-400" :
                  "text-accent-cyan"
                }`}>
                  {op.status === "done" ? "✓" : op.status === "warn" ? "!" : "›"}
                </span>
                <span className="text-accent-purple/80 shrink-0">[{op.service}]</span>
                <span className={`truncate ${
                  op.status === "done" ? "text-foreground-muted" :
                  op.status === "warn" ? "text-orange-400" :
                  "text-foreground-dim"
                }`}>
                  {op.action}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Cursor */}
        {!isComplete && allOps.length > 0 && (
          <motion.div
            className="flex items-center gap-1.5 py-0.5"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          >
            <span className="text-foreground-dim/60 w-10">
              {String(Math.floor(timeCounter / 60)).padStart(2, "0")}:{String(timeCounter % 60).padStart(2, "0")}
            </span>
            <span className="text-accent-cyan">_</span>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-background-border bg-background-elevated/30 font-sans">
        <div className="flex justify-between text-[10px] text-foreground-dim">
          <span>Ops: {allOps.length}</span>
          <span>Services: {new Set(allOps.map(o => o.service)).size}</span>
          <span>{isComplete ? "✓ OK" : "..."}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function AgentFlow3D() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeDemo, setActiveDemo] = useState(0);
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [phase, setPhase] = useState<"idle" | "running" | "paused" | "complete">("idle");

  // Sync animation between both panels
  useEffect(() => {
    if (!isInView) {
      setVisibleSteps(0);
      setPhase("idle");
      return;
    }

    setPhase("running");
    let step = 0;
    const demo = demos[activeDemo];

    const runSteps = () => {
      const interval = setInterval(() => {
        if (step < demo.steps.length) {
          const currentStep = demo.steps[step];
          setVisibleSteps(step + 1);

          // Pause at approval step
          if (currentStep.type === "approval") {
            setPhase("paused");
            clearInterval(interval);

            // Auto-approve after 2 seconds
            setTimeout(() => {
              setPhase("running");
              step++;
              runSteps();
            }, 2000);
            return;
          }

          step++;
        } else {
          setPhase("complete");
          clearInterval(interval);
        }
      }, 900);

      return interval;
    };

    const interval = runSteps();
    return () => clearInterval(interval);
  }, [isInView, activeDemo]);

  // Reset when demo changes
  useEffect(() => {
    setVisibleSteps(0);
    setPhase("idle");
  }, [activeDemo]);

  const isComplete = phase === "complete";

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Circuit grid background */}
      <CircuitGrid />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(0,212,255,0.15),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <svg className="w-4 h-4 text-accent-purple" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
              </svg>
            </motion.div>
            <span className="text-sm text-foreground-muted">Self-evolving agents</span>
          </motion.div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Agents that </span>
            <span className="gradient-text">fix themselves.</span>
          </h2>

          <p className="text-lg max-w-2xl mx-auto mb-4 text-foreground-body">
            When evals fail or anomalies appear, your agents diagnose the issue
            and propose fixes — you stay in control with one-click approval.
          </p>

          <p className="text-sm max-w-xl mx-auto text-foreground-dim">
            No manual debugging. No 3 AM alerts. Just continuous improvement.
          </p>
        </motion.div>

        {/* Demo selector - Two clear scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3 }}
          className="flex justify-center mb-8"
        >
          <div className="nm-inset p-2 flex gap-2">
            {demos.map((demo, i) => (
              <button
                key={demo.id}
                onClick={() => setActiveDemo(i)}
                className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 flex flex-col items-center gap-1 ${
                  activeDemo === i
                    ? "nm-extruded-sm text-accent-cyan"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d={demo.icon} />
                  </svg>
                  {demo.label}
                </div>
                <span className={`text-[10px] ${activeDemo === i ? "text-accent-cyan/70" : "text-foreground-dim"}`}>
                  {demo.description}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Split Demo Container - Side by Side Windows */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.4 }}
        >
          {/* Window Labels - change based on demo type */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-4 max-w-7xl mx-auto mb-2">
            <div className="flex items-center gap-2 pl-4">
              <div className={`w-2 h-2 rounded-full ${demos[activeDemo].id === "production" ? "bg-accent-green" : "bg-accent-cyan"}`} />
              <span className="text-xs text-foreground-dim uppercase tracking-wider">
                {demos[activeDemo].id === "production" ? "Production Monitor" : "Agent Builder"}
              </span>
            </div>
            <div className="flex items-center gap-2 pl-4">
              <div className="w-2 h-2 rounded-full bg-accent-purple" />
              <span className="text-xs text-foreground-dim uppercase tracking-wider">
                {demos[activeDemo].id === "production" ? "Infrastructure Logs" : "System Logs"}
              </span>
            </div>
          </div>

          {/* Dual Window Container */}
          <div className="max-w-7xl mx-auto">
            <div className="relative grid lg:grid-cols-2 gap-4">
              {/* Connection Line between panels */}
              <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px z-10">
                <div className="h-full bg-gradient-to-b from-transparent via-accent-cyan/30 to-transparent" />
                {/* Animated data flow dots */}
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-accent-cyan"
                    animate={{
                      top: ["0%", "100%"],
                      opacity: [0, 1, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: i * 0.6,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                ))}
              </div>

              {/* LEFT: Agent Builder - What user sees */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.4 }}
                className="h-[620px]"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeDemo}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    <DemoVisualization
                      demo={demos[activeDemo]}
                      isActive={isInView}
                    />
                  </motion.div>
                </AnimatePresence>
              </motion.div>

              {/* RIGHT: System Logs - What's happening behind the scenes */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="hidden lg:block h-[620px]"
              >
                <BackgroundLogPanel
                  visibleSteps={visibleSteps}
                  demo={demos[activeDemo]}
                  isComplete={isComplete}
                />
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Value props - Different for Build vs Production */}
        <AnimatePresence mode="wait">
          <motion.div
            key={demos[activeDemo].id + "-features"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {(demos[activeDemo].id === "build" ? [
            {
              icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z",
              title: "Natural Language",
              desc: "Describe your agent in plain English — no code required",
              color: "cyan"
            },
            {
              icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4",
              title: "Auto Eval Testing",
              desc: "24 test scenarios run automatically before deployment",
              color: "purple"
            },
            {
              icon: "M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z",
              title: "Self-Healing Build",
              desc: "Automatically fixes issues found during evaluation",
              color: "green"
            },
          ] : [
            {
              icon: "M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z",
              title: "24/7 Monitoring",
              desc: "Deployed agents are monitored around the clock for anomalies",
              color: "purple"
            },
            {
              icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
              title: "Email Notifications",
              desc: "Get notified instantly when issues are detected with proposed fixes",
              color: "cyan"
            },
            {
              icon: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z",
              title: "One-Click Approval",
              desc: "Review and approve fixes via email — you stay in control",
              color: "green"
            },
          ]).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 + i * 0.1 }}
              className="text-center"
            >
              <div className={`nm-extruded-sm w-12 h-12 mx-auto mb-4 flex items-center justify-center relative overflow-hidden`}>
                <div className={`absolute inset-0 ${
                  item.color === "purple" ? "bg-gradient-to-br from-accent-purple/20 to-transparent" :
                  item.color === "green" ? "bg-gradient-to-br from-accent-green/20 to-transparent" :
                  "bg-gradient-to-br from-accent-cyan/20 to-transparent"
                }`} />
                <svg className={`w-6 h-6 relative z-10 ${
                  item.color === "purple" ? "text-accent-purple" :
                  item.color === "green" ? "text-accent-green" :
                  "text-accent-cyan"
                }`} fill="currentColor" viewBox="0 0 24 24">
                  <path d={item.icon} />
                </svg>
              </div>
              <div className="text-lg font-semibold text-foreground mb-2">{item.title}</div>
              <div className="text-sm text-foreground-dim">{item.desc}</div>
            </motion.div>
          ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
