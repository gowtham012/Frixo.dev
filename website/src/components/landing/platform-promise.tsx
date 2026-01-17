"use client";

import { motion } from "framer-motion";

const evalTypes = [
  {
    name: "Functional",
    description: "Output matches expected behavior",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Quality",
    description: "Coherent, well-structured responses",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
  {
    name: "Safety",
    description: "No harmful or biased content",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    name: "Freshness",
    description: "Data validated as current",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Latency",
    description: "Response within time limits",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    name: "Consistency",
    description: "Reproducible results",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  {
    name: "Cost",
    description: "Within budget constraints",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export function PlatformPromise() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background with dramatic gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-[#0D1117] to-background" />

      {/* Glow effect */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-green/5 rounded-full blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          {/* The Promise */}
          <div className="max-w-4xl mx-auto">
            <span className="inline-block text-sm font-semibold text-accent-green tracking-wider uppercase">
              Our Promise
            </span>

            {/* Main Statement */}
            <h2 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              If evals fail,{" "}
              <span className="relative">
                <span className="relative z-10 text-accent-green">
                  output is blocked
                </span>
                <span className="absolute inset-0 bg-accent-green/20 blur-xl" />
              </span>
            </h2>

            <p className="mt-6 text-xl text-foreground-body max-w-2xl mx-auto">
              Every agent output passes through 7 types of evaluations before delivery.
              No exceptions. No manual checks. Automatic quality enforcement.
            </p>
          </div>

          {/* Eval Types Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {evalTypes.map((eval_, index) => (
                <motion.div
                  key={eval_.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
                  className="group relative"
                >
                  <div className="relative rounded-xl border border-accent-green/20 bg-accent-green/5 p-4 transition-all duration-300 hover:border-accent-green/40 hover:bg-accent-green/10">
                    <div className="text-accent-green mb-2">{eval_.icon}</div>
                    <div className="text-sm font-semibold text-white">{eval_.name}</div>
                    <div className="text-xs text-foreground-muted mt-1 hidden sm:block">
                      {eval_.description}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Visual Flow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8"
          >
            {/* Agent Output */}
            <div className="flex items-center gap-3 rounded-full border border-white/20 bg-background-card px-6 py-3">
              <div className="h-3 w-3 rounded-full bg-accent-blue animate-pulse" />
              <span className="text-sm text-white font-medium">Agent Output</span>
            </div>

            {/* Arrow */}
            <svg className="h-6 w-6 text-foreground-muted rotate-90 sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>

            {/* Eval Engine */}
            <div className="flex items-center gap-3 rounded-full border border-accent-green/30 bg-accent-green/10 px-6 py-3">
              <svg className="h-5 w-5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-sm text-accent-green font-semibold">7 Eval Checks</span>
            </div>

            {/* Arrow */}
            <svg className="h-6 w-6 text-foreground-muted rotate-90 sm:rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>

            {/* Delivered or Blocked */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/10 px-4 py-2">
                <svg className="h-4 w-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs text-accent-green font-medium">Pass: Delivered</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2">
                <svg className="h-4 w-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span className="text-xs text-red-400 font-medium">Fail: Blocked</span>
              </div>
            </div>
          </motion.div>

          {/* Bottom Note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-12 text-sm text-foreground-muted max-w-xl mx-auto"
          >
            Evals are auto-generated for every agent based on its purpose.
            Customize thresholds, add custom evals, or use our defaults.
            Your agents, your standards—automatically enforced.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
