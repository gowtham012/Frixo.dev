"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const buildOptions = [
  {
    id: "prompt",
    title: "Build with Prompts",
    subtitle: "No code required",
    description: "Describe your agent in plain English. Our platform handles prompt optimization, tool connections, and the complete production stack automatically.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    gradient: "from-accent-cyan to-accent-blue",
    features: ["Visual builder", "One-click deploy", "No coding needed", "You approve changes"],
  },
  {
    id: "sdk",
    title: "Build with Code",
    subtitle: "Full control",
    description: "Use our Python or TypeScript SDK for complete control. Define custom tools, complex logic, and integrate with your existing codebase.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    gradient: "from-accent-purple to-accent-pink",
    features: ["Python & TypeScript", "Custom tools", "Full flexibility", "Open source SDK"],
  },
];

// Production Features for Prompt-based builds (no-code users)
// Each has position offsets for scattered floating layout (left/right emphasis)
const promptProductionFeatures = [
  {
    name: "24/7 Monitoring",
    description: "Always-on dashboards and health checks",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    position: { x: -25, y: -8, rotate: -3 },
  },
  {
    name: "Email Notifications",
    description: "Instant alerts on failures or completions",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    position: { x: 20, y: 5, rotate: 2 },
  },
  {
    name: "One-Click Approval",
    description: "Review and approve changes instantly",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    position: { x: -18, y: 12, rotate: -2 },
  },
  {
    name: "Visual Logs",
    description: "See every step in an easy timeline view",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
    position: { x: 28, y: -5, rotate: 3 },
  },
  {
    name: "Auto-Recovery",
    description: "Smart retries and fallback handling",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
      </svg>
    ),
    position: { x: -30, y: 0, rotate: -4 },
  },
  {
    name: "Usage Analytics",
    description: "Track costs and performance metrics",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
      </svg>
    ),
    position: { x: 25, y: 10, rotate: 2 },
  },
];

// Production Features for SDK-based builds (developers)
// Each has position offsets for scattered floating layout (left/right emphasis)
const sdkProductionFeatures = [
  {
    name: "Full SDK Access",
    description: "Python & TypeScript with type safety",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    position: { x: -28, y: -5, rotate: -2 },
  },
  {
    name: "Custom Tools",
    description: "Define your own integrations and logic",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
      </svg>
    ),
    position: { x: 22, y: 8, rotate: 3 },
  },
  {
    name: "Git Integration",
    description: "Version control and CI/CD pipelines",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    position: { x: -20, y: 10, rotate: -3 },
  },
  {
    name: "Debug Tools",
    description: "Step-through execution and breakpoints",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    position: { x: 30, y: -8, rotate: 2 },
  },
  {
    name: "Local Testing",
    description: "Run and test agents on your machine",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    position: { x: -32, y: 3, rotate: -4 },
  },
  {
    name: "Open Source",
    description: "Full access to SDK source code",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
      </svg>
    ),
    position: { x: 26, y: 12, rotate: 4 },
  },
];

// Animated prompt demo
function PromptDemo({ isActive }: { isActive: boolean }) {
  const [phase, setPhase] = useState(0);
  const [typedText, setTypedText] = useState("");

  const promptText = "Create a LinkedIn content agent that posts about AI trends every day at 10am. It should research recent news and write professional posts.";

  // Typing animation
  useEffect(() => {
    if (!isActive) {
      setPhase(0);
      setTypedText("");
      return;
    }

    let charIndex = 0;
    const typeInterval = setInterval(() => {
      if (charIndex <= promptText.length) {
        setTypedText(promptText.slice(0, charIndex));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // Move to processing phase
        setTimeout(() => setPhase(1), 500);
      }
    }, 30);

    return () => clearInterval(typeInterval);
  }, [isActive]);

  // Progress through phases
  useEffect(() => {
    if (phase === 1) {
      const timer = setTimeout(() => setPhase(2), 1500);
      return () => clearTimeout(timer);
    }
    if (phase === 2) {
      const timer = setTimeout(() => setPhase(3), 1000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  return (
    <div className="space-y-4">
      {/* User Input */}
      <div className="flex items-start gap-3">
        <div className="nm-extruded-sm w-9 h-9 flex items-center justify-center flex-shrink-0 bg-accent-cyan/10">
          <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div className="flex-1">
          <div className="nm-inset-sm px-4 py-3 rounded-xl rounded-tl-sm min-h-[80px]">
            <p className="text-sm text-foreground">
              {typedText}
              {phase === 0 && <span className="animate-pulse text-accent-cyan">|</span>}
            </p>
          </div>
        </div>
      </div>

      {/* AI Processing / Response */}
      <AnimatePresence mode="wait">
        {phase >= 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-3"
          >
            <div className="nm-extruded-sm w-9 h-9 flex items-center justify-center flex-shrink-0 bg-accent-purple/10">
              <motion.div
                animate={phase === 1 ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: phase === 1 ? Infinity : 0, ease: "linear" }}
              >
                <svg className="w-4 h-4 text-accent-purple" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A2.5 2.5 0 005 15.5 2.5 2.5 0 007.5 18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 007.5 13m9 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.5 0 00-2.5-2.5z"/>
                </svg>
              </motion.div>
            </div>
            <div className="flex-1">
              {phase === 1 && (
                <div className="nm-extruded-sm px-4 py-3 rounded-xl rounded-tl-sm">
                  <div className="flex items-center gap-2 text-sm text-accent-purple">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-accent-purple"
                    />
                    Analyzing your requirements...
                  </div>
                </div>
              )}
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="nm-extruded-sm rounded-xl rounded-tl-sm overflow-hidden"
                >
                  {/* Agent Config Header */}
                  <div className="px-4 py-3 bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10 border-b border-background-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">LinkedIn Content Agent</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-green/20 text-accent-green">Ready</span>
                    </div>
                  </div>

                  {/* Config Details */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="nm-inset-sm px-3 py-2">
                        <span className="text-foreground-dim">Trigger</span>
                        <div className="text-foreground mt-0.5">Daily @ 10:00 AM</div>
                      </div>
                      <div className="nm-inset-sm px-3 py-2">
                        <span className="text-foreground-dim">Tools</span>
                        <div className="text-foreground mt-0.5">3 connected</div>
                      </div>
                    </div>

                    {/* Connected Tools */}
                    <div className="flex items-center gap-2">
                      {[
                        { name: "LinkedIn", color: "bg-[#0A66C2]" },
                        { name: "Web Search", color: "bg-accent-cyan" },
                        { name: "Content AI", color: "bg-accent-purple" },
                      ].map((tool, i) => (
                        <motion.div
                          key={tool.name}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center gap-1.5 text-[10px] text-foreground-muted nm-extruded-sm px-2 py-1"
                        >
                          <div className={`w-2 h-2 rounded-full ${tool.color}`} />
                          {tool.name}
                        </motion.div>
                      ))}
                    </div>

                    {/* Eval Status */}
                    {phase >= 3 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between pt-2 border-t border-background-border"
                      >
                        <div className="flex items-center gap-2 text-xs text-accent-green">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          24 evals passed
                        </div>
                        <button className="text-[10px] px-3 py-1.5 bg-accent-cyan text-background rounded-lg font-medium">
                          Deploy
                        </button>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Self-evolution indicator */}
      <div className="flex items-center gap-2 text-xs text-foreground-dim pl-12">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        >
          <svg className="w-4 h-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
          </svg>
        </motion.div>
        Self-evolution enabled with user approval
      </div>
    </div>
  );
}

// Animated code demo with syntax highlighting
function CodeDemo({ isActive }: { isActive: boolean }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [showOutput, setShowOutput] = useState(false);

  const codeLines = [
    { indent: 0, tokens: [{ text: "from", type: "keyword" }, { text: " agent_platform ", type: "normal" }, { text: "import", type: "keyword" }, { text: " Agent, Tool", type: "class" }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ text: "agent", type: "variable" }, { text: " = ", type: "normal" }, { text: "Agent", type: "class" }, { text: "(", type: "normal" }] },
    { indent: 1, tokens: [{ text: "name", type: "param" }, { text: "=", type: "normal" }, { text: '"meeting-prep"', type: "string" }, { text: ",", type: "normal" }] },
    { indent: 1, tokens: [{ text: "tools", type: "param" }, { text: "=[calendar, linkedin, gmail],", type: "normal" }] },
    { indent: 1, tokens: [{ text: "trigger", type: "param" }, { text: "=", type: "normal" }, { text: '"calendar:meeting_starting"', type: "string" }, { text: ",", type: "normal" }] },
    { indent: 1, tokens: [{ text: "self_evolution", type: "param" }, { text: "=", type: "normal" }, { text: "True", type: "keyword" }, { text: ",", type: "normal" }, { text: "  # Auto-fix failures", type: "comment" }] },
    { indent: 1, tokens: [{ text: "require_approval", type: "param" }, { text: "=", type: "normal" }, { text: "True", type: "keyword" }, { text: "  # You control changes", type: "comment" }] },
    { indent: 0, tokens: [{ text: ")", type: "normal" }] },
    { indent: 0, tokens: [] },
    { indent: 0, tokens: [{ text: "agent", type: "variable" }, { text: ".", type: "normal" }, { text: "deploy", type: "function" }, { text: "()", type: "normal" }] },
  ];

  useEffect(() => {
    if (!isActive) {
      setVisibleLines(0);
      setShowOutput(false);
      return;
    }

    let line = 0;
    const interval = setInterval(() => {
      if (line <= codeLines.length) {
        setVisibleLines(line);
        line++;
      } else {
        clearInterval(interval);
        setTimeout(() => setShowOutput(true), 500);
      }
    }, 150);

    return () => clearInterval(interval);
  }, [isActive]);

  const getTokenColor = (type: string) => {
    switch (type) {
      case "keyword": return "text-accent-purple";
      case "class": return "text-accent-cyan";
      case "string": return "text-accent-green";
      case "comment": return "text-foreground-dim italic";
      case "param": return "text-orange-400";
      case "function": return "text-yellow-400";
      case "variable": return "text-foreground";
      default: return "text-foreground-muted";
    }
  };

  return (
    <div className="space-y-4">
      {/* Code Editor */}
      <div className="nm-inset-sm rounded-xl overflow-hidden">
        <div className="p-4 font-mono text-sm overflow-x-auto">
          {codeLines.slice(0, visibleLines).map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex"
            >
              <span className="w-6 text-foreground-dim/40 select-none text-right mr-4">{i + 1}</span>
              <span style={{ paddingLeft: `${line.indent * 1.5}rem` }}>
                {line.tokens.map((token, j) => (
                  <span key={j} className={getTokenColor(token.type)}>{token.text}</span>
                ))}
              </span>
            </motion.div>
          ))}
          {visibleLines < codeLines.length && (
            <motion.div
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="flex"
            >
              <span className="w-6 text-foreground-dim/40 select-none text-right mr-4">{visibleLines + 1}</span>
              <span className="text-accent-cyan">|</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* Terminal Output */}
      <AnimatePresence>
        {showOutput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="nm-extruded-sm rounded-xl overflow-hidden"
          >
            <div className="px-4 py-2 border-b border-background-border flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-xs text-foreground-dim font-mono">Terminal</span>
            </div>
            <div className="p-4 font-mono text-xs space-y-1">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-foreground-dim"
              >
                $ python agent.py
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-accent-cyan"
              >
                ✓ Agent "meeting-prep" registered
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-accent-cyan"
              >
                ✓ Connected to 3 tools
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-accent-green"
              >
                ✓ Running 24 eval scenarios... all passed
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-accent-green font-medium"
              >
                ✓ Deployed to production (us-east, eu-west)
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Documentation link */}
      <div className="flex items-center justify-center gap-2 text-xs text-foreground-dim">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        Full SDK docs at docs.getpitlanes.com
      </div>
    </div>
  );
}

export function BuildOptions() {
  const [activeOption, setActiveOption] = useState("prompt");
  const [demoKey, setDemoKey] = useState(0);
  const demoRef = useRef(null);
  const isInView = useInView(demoRef, { once: true, margin: "-100px" });

  const activeData = buildOptions.find((o) => o.id === activeOption);

  // Reset demo when switching tabs
  const handleTabChange = (optionId: string) => {
    setActiveOption(optionId);
    setDemoKey(prev => prev + 1);
  };

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-[200px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
            <span className="text-sm text-foreground-muted">Two Ways to Build</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-foreground">Your way, </span>
            <span className="gradient-text">your choice</span>
          </h2>
          <p className="mt-4 text-foreground-body max-w-xl mx-auto">
            Start with prompts for quick prototyping, or use our SDK for full control.
            Both approaches get self-evolution and the same powerful infrastructure.
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center mb-12"
        >
          <div className="nm-inset p-2 flex gap-2">
            {buildOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => handleTabChange(option.id)}
                className={`relative px-6 py-3 text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeOption === option.id
                    ? "nm-extruded-sm text-foreground"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                {activeOption === option.id && (
                  <motion.div
                    layoutId="activeTabBg"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${option.gradient} opacity-10`}
                    transition={{ type: "spring", duration: 0.5 }}
                  />
                )}
                <span className="relative">{option.icon}</span>
                <span className="relative">{option.title}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content with floating features */}
        <div className="relative">
          {/* Floating production features - scattered around the windows */}
          <AnimatePresence mode="sync">
            {(activeOption === "prompt" ? promptProductionFeatures : sdkProductionFeatures).map((feature, i) => {
              // Position each card in specific spots around the content - well spaced vertically
              const positions = [
                // Left side positions (spaced 160px apart)
                { className: "hidden xl:block absolute -left-4 top-0 -translate-x-full", delay: 0, rotate: -3 },
                { className: "hidden xl:block absolute -left-8 top-[160px] -translate-x-full", delay: 0.1, rotate: 2 },
                { className: "hidden xl:block absolute -left-4 top-[320px] -translate-x-full", delay: 0.2, rotate: -2 },
                // Right side positions (spaced 160px apart)
                { className: "hidden xl:block absolute -right-4 top-0 translate-x-full", delay: 0.15, rotate: 3 },
                { className: "hidden xl:block absolute -right-8 top-[160px] translate-x-full", delay: 0.25, rotate: -2 },
                { className: "hidden xl:block absolute -right-4 top-[320px] translate-x-full", delay: 0.3, rotate: 2 },
              ];
              const pos = positions[i];

              return (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    rotate: pos.rotate,
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.08, rotate: 0 }}
                  transition={{ delay: pos.delay, duration: 0.5, type: "spring" }}
                  className={`${pos.className} nm-extruded p-3 w-32 text-center cursor-pointer z-10 ${
                    activeOption === "prompt" ? "hover:bg-accent-cyan/5" : "hover:bg-accent-purple/5"
                  }`}
                >
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2.5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className={`nm-extruded-sm w-8 h-8 mx-auto mb-2 flex items-center justify-center ${
                      activeOption === "prompt" ? "text-accent-cyan" : "text-accent-purple"
                    }`}>
                      {feature.icon}
                    </div>
                    <div className="text-xs font-medium text-foreground mb-0.5">{feature.name}</div>
                    <div className="text-[9px] text-foreground-dim leading-tight">{feature.description}</div>
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Main content grid */}
          <div className="grid lg:grid-cols-2 gap-8 items-stretch">
          {/* Left - Description */}
          <motion.div
            key={activeOption + "-desc"}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="nm-extruded p-8 flex flex-col"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`nm-extruded-sm w-14 h-14 flex items-center justify-center relative overflow-hidden`}>
                <div className={`absolute inset-0 bg-gradient-to-br ${activeData?.gradient} opacity-20`} />
                <div className="relative text-accent-cyan">
                  {activeData?.icon}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{activeData?.title}</h3>
                <p className="text-sm text-foreground-muted">{activeData?.subtitle}</p>
              </div>
            </div>

            <p className="text-foreground-body leading-relaxed mb-8">
              {activeData?.description}
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {activeData?.features.map((feature, i) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="nm-inset-sm px-4 py-3 flex items-center gap-2"
                >
                  <svg className="w-4 h-4 flex-shrink-0 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm text-foreground-muted">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Interactive Demo */}
          <motion.div
            key={activeOption + "-example"}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="nm-extruded overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-background-border">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-green-500/50" />
                  </div>
                  <span className="text-xs text-foreground-dim">
                    {activeOption === "prompt" ? "Agent Builder" : "agent.py"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`w-2 h-2 rounded-full ${activeOption === "prompt" ? "bg-accent-cyan" : "bg-accent-purple"}`}
                  />
                  <span className="text-[10px] text-foreground-dim">Live</span>
                </div>
              </div>

              {/* Demo Content */}
              <div ref={demoRef} className="p-6 min-h-[380px]">
                <AnimatePresence mode="wait">
                  {activeOption === "prompt" ? (
                    <motion.div
                      key={`prompt-${demoKey}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <PromptDemo isActive={isInView} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key={`code-${demoKey}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <CodeDemo isActive={isInView} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
          </div>
        </div>

        {/* Mobile-only: Production Features (shown below on smaller screens) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 xl:hidden"
        >
          <div className="text-center mb-4">
            <p className="text-sm text-foreground-muted">
              {activeOption === "prompt" ? (
                <>Production features for <span className="text-accent-cyan font-medium">no-code builds</span></>
              ) : (
                <>Developer tools for <span className="text-accent-purple font-medium">code-first builds</span></>
              )}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {(activeOption === "prompt" ? promptProductionFeatures : sdkProductionFeatures).map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`nm-extruded p-3 text-center ${
                  activeOption === "prompt" ? "hover:bg-accent-cyan/5" : "hover:bg-accent-purple/5"
                }`}
              >
                <div className={`nm-extruded-sm w-8 h-8 mx-auto mb-2 flex items-center justify-center ${
                  activeOption === "prompt" ? "text-accent-cyan" : "text-accent-purple"
                }`}>
                  {feature.icon}
                </div>
                <div className="text-xs font-medium text-foreground mb-0.5">{feature.name}</div>
                <div className="text-[9px] text-foreground-dim leading-tight">{feature.description}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
