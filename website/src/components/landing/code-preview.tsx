"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";

// Simulated conversation showing the self-evolution flow
const conversationSteps = [
  {
    type: "user",
    content: "Create a customer support agent for my e-commerce store that can check order status, process returns, and answer product questions.",
  },
  {
    type: "system",
    content: "Building your agent...",
    isLoading: true,
  },
  {
    type: "agent",
    content: "Agent created with 3 capabilities:",
    details: [
      "Order lookup via your Shopify API",
      "Return processing with approval workflow",
      "Product Q&A from your catalog",
    ],
  },
  {
    type: "system",
    content: "Running 47 eval scenarios...",
    isLoading: true,
  },
  {
    type: "warning",
    content: "44/47 passed - 3 failures detected",
  },
  {
    type: "evolution",
    content: "Self-diagnosis initiated",
    diagnosis: "Return policy responses missing regional variations",
    fix: "Add region-aware return policy lookup",
  },
  {
    type: "approval",
    content: "Approve fix?",
  },
  {
    type: "success",
    content: "All tests passed. Agent deployed.",
    stats: { accuracy: "98.2%", selfHealing: "Enabled", latency: "1.2s" },
  },
];

export function CodePreview() {
  const [visibleSteps, setVisibleSteps] = useState(0);
  const [approved, setApproved] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;

    const timers: NodeJS.Timeout[] = [];
    let currentStep = 0;

    const showNextStep = () => {
      if (currentStep < conversationSteps.length) {
        const step = conversationSteps[currentStep];

        // Pause at approval step
        if (step.type === "approval" && !approved) {
          setVisibleSteps(currentStep + 1);
          // Auto-approve after 2 seconds
          const approvalTimer = setTimeout(() => {
            setApproved(true);
            currentStep++;
            showNextStep();
          }, 2000);
          timers.push(approvalTimer);
          return;
        }

        setVisibleSteps(currentStep + 1);
        currentStep++;

        const timer = setTimeout(showNextStep, step.type === "evolution" ? 1500 : 1000);
        timers.push(timer);
      }
    };

    const initialTimer = setTimeout(showNextStep, 500);
    timers.push(initialTimer);

    return () => timers.forEach(clearTimeout);
  }, [isInView, approved]);

  return (
    <section ref={ref} className="relative py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
            <span className="text-sm text-foreground-muted">Live Demo</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            <span className="text-foreground">Describe it. We build it.</span>
            <br />
            <span className="gradient-text">It evolves.</span>
          </h2>
          <p className="mt-4 text-foreground-body max-w-xl mx-auto">
            Tell us what you need. Our platform handles the build, runs evals,
            and when issues arise — fixes them automatically with your approval.
          </p>
        </motion.div>

        {/* Chat Interface */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          {/* Chat window */}
          <div className="nm-extruded overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-background-border">
              <div className="flex items-center gap-3">
                <div className="nm-extruded-sm w-10 h-10 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20" />
                  <svg className="w-5 h-5 text-accent-cyan relative z-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-foreground">Agent Builder</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                <span className="text-xs text-foreground-muted">Live</span>
              </div>
            </div>

            {/* Chat Content */}
            <div className="p-6 min-h-[450px] space-y-4">
              {conversationSteps.slice(0, visibleSteps).map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${step.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  {step.type === "user" ? (
                    <div className="max-w-[80%] nm-inset-sm px-4 py-3 rounded-br-sm">
                      <p className="text-sm text-foreground">{step.content}</p>
                    </div>
                  ) : step.type === "system" ? (
                    <div className="nm-extruded-sm flex items-center gap-2 px-4 py-2">
                      {step.isLoading && (
                        <svg className="w-4 h-4 text-accent-cyan animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      <span className="text-xs text-foreground-muted">{step.content}</span>
                    </div>
                  ) : step.type === "agent" ? (
                    <div className="max-w-[80%] nm-extruded-sm px-4 py-3 rounded-bl-sm">
                      <p className="text-sm text-foreground mb-2">{step.content}</p>
                      <ul className="space-y-1.5">
                        {step.details?.map((detail, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-foreground-muted">
                            <span className="nm-extruded-sm w-4 h-4 flex items-center justify-center">
                              <svg className="w-2.5 h-2.5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : step.type === "warning" ? (
                    <div className="nm-inset-sm flex items-center gap-2 px-4 py-2 border-l-2 border-orange-500">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span className="text-xs text-orange-400">{step.content}</span>
                    </div>
                  ) : step.type === "evolution" ? (
                    <div className="max-w-[85%] nm-extruded px-4 py-4 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-accent-purple/5" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="nm-inset-sm w-6 h-6 rounded-full flex items-center justify-center"
                          >
                            <svg className="w-3.5 h-3.5 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
                            </svg>
                          </motion.div>
                          <span className="text-sm font-medium text-accent-cyan">{step.content}</span>
                        </div>
                        <div className="space-y-2 pl-8">
                          <div className="nm-inset-sm px-3 py-2">
                            <span className="text-xs text-foreground-dim">Issue: </span>
                            <span className="text-xs text-foreground-muted">{step.diagnosis}</span>
                          </div>
                          <div className="nm-extruded-sm px-3 py-2">
                            <span className="text-xs text-foreground-dim">Fix: </span>
                            <span className="text-xs text-foreground">{step.fix}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : step.type === "approval" ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-all ${
                        approved
                          ? "nm-extruded-sm text-accent-green"
                          : "btn-hybrid"
                      }`}
                    >
                      {approved ? (
                        <>
                          <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Approved</span>
                        </>
                      ) : (
                        <>
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="w-2 h-2 rounded-full bg-accent-cyan"
                          />
                          <span>Approve Fix</span>
                        </>
                      )}
                    </motion.button>
                  ) : step.type === "success" ? (
                    <div className="max-w-[85%] nm-extruded px-4 py-3 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-accent-green/5 to-transparent" />
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="nm-extruded-sm w-6 h-6 flex items-center justify-center">
                            <svg className="w-4 h-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-accent-green">{step.content}</span>
                        </div>
                        <div className="flex gap-4 pl-8">
                          {step.stats && Object.entries(step.stats).map(([key, value]) => (
                            <div key={key} className="nm-inset-sm px-3 py-2 text-center">
                              <div className="text-lg font-bold text-foreground">{value}</div>
                              <div className="text-xs text-foreground-muted capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              ))}

              {/* Typing indicator when loading */}
              {visibleSteps < conversationSteps.length && visibleSteps > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1.5 px-4 py-2"
                >
                  <div className="w-2 h-2 rounded-full bg-foreground-dim animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 rounded-full bg-foreground-dim animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 rounded-full bg-foreground-dim animate-bounce" style={{ animationDelay: "300ms" }} />
                </motion.div>
              )}
            </div>
          </div>

          {/* Floating stats */}
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex gap-4 sm:gap-6">
            <div className="nm-extruded-sm flex items-center gap-2 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-accent-cyan" />
              <span className="text-sm text-foreground-muted">Self-evolving</span>
            </div>
            <div className="hidden sm:flex nm-extruded-sm items-center gap-2 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-accent-green" />
              <span className="text-sm text-foreground-muted">User-approved</span>
            </div>
            <div className="hidden md:flex nm-extruded-sm items-center gap-2 px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-accent-purple" />
              <span className="text-sm text-foreground-muted">Production-ready</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
