"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const platformFeatures = [
  {
    title: "Describe & Deploy",
    description: "Natural language to production in minutes",
  },
  {
    title: "Full Observability",
    description: "Trace every decision, track every cost",
  },
  {
    title: "Self-Evolution",
    description: "Agents improve automatically, you approve",
  },
  {
    title: "Any Integration",
    description: "Connect to any app, any API",
  },
];

const capabilities = [
  {
    label: "Guardrails",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    label: "Full Tracing",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: "Auto Evals",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    label: "Enterprise Security",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
  {
    label: "Auto-Scaling",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    label: "Self-Improvement",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
      </svg>
    ),
  },
];

export function SDKHighlight() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-accent-cyan/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-accent-purple/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
          {/* Left - Content - Slides from left */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-8"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              >
                <svg className="h-4 w-4 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
                </svg>
              </motion.div>
              <span className="text-sm text-foreground-muted">Full Platform</span>
            </motion.div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-6">
              <span className="text-foreground">You Describe.</span>
              <br />
              <span className="gradient-text">We Handle Production.</span>
            </h2>

            {/* Description */}
            <p className="text-lg text-foreground-body max-w-lg mb-10">
              <span className="text-accent-cyan">One prompt. Any agent.</span> Build with integrated
              evals, tracing, A2A, memory, and multi-LLM fallback. Self-evolving agents.
              <span className="text-accent-green"> Deploy. Sell on marketplace.</span>
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-10">
              {platformFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="nm-inset-sm p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="nm-extruded-sm w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="h-3.5 w-3.5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-foreground">{feature.title}</h4>
                      <p className="text-xs text-foreground-dim mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link href="#waitlist" className="btn-hybrid px-6 py-3 flex items-center gap-2">
                Join Waitlist
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="/docs"
                className="nm-button px-6 py-3 flex items-center gap-2 text-foreground-muted hover:text-accent-cyan transition-colors"
              >
                Explore Features
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </motion.div>

          {/* Right - Visual - Slides from right */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mt-12 lg:mt-0"
          >
            {/* Platform Preview Card */}
            <div className="nm-extruded overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-background-border">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full nm-inset-sm" />
                    <div className="h-3 w-3 rounded-full nm-inset-sm" />
                    <div className="h-3 w-3 rounded-full nm-inset-sm" />
                  </div>
                  <span className="text-xs text-foreground-dim">Platform Overview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
                  <span className="text-xs text-foreground-muted">Live</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Capabilities Grid */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {capabilities.map((cap, i) => (
                    <motion.div
                      key={cap.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ margin: "-100px" }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className="card-hybrid p-4 flex flex-col items-center gap-2 group"
                    >
                      <div className="text-accent-cyan group-hover:text-accent-purple transition-colors">{cap.icon}</div>
                      <span className="text-xs text-foreground-muted text-center">{cap.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Stats Bar */}
                <div className="nm-inset p-4 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text">5min</div>
                    <div className="text-xs text-foreground-muted">to production</div>
                  </div>
                  <div className="w-px h-10 bg-background-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold gradient-text">6</div>
                    <div className="text-xs text-foreground-muted">prod layers</div>
                  </div>
                  <div className="w-px h-10 bg-background-border" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-accent-green">You</div>
                    <div className="text-xs text-foreground-muted">approve changes</div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-background-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground-dim">Works with</span>
                  <div className="flex gap-4">
                    <span className="nm-extruded-sm px-2 py-1 text-foreground-muted">OpenAI</span>
                    <span className="nm-extruded-sm px-2 py-1 text-foreground-muted">Anthropic</span>
                    <span className="nm-extruded-sm px-2 py-1 text-foreground-muted">+ more</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
