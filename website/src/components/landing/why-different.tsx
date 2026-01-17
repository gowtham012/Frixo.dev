"use client";

import { motion } from "framer-motion";

const comparisons = [
  {
    title: "Other Platforms",
    items: [
      "Template-based agent creation",
      "Manual eval setup for each agent",
      "Complex infrastructure configuration",
      "Limited observability options",
      "Rigid deployment pipelines",
    ],
    isAlternative: true,
  },
  {
    title: "Pitlane",
    items: [
      "Natural language → production agent",
      "7 eval types auto-generated",
      "Zero infrastructure to manage",
      "End-to-end tracing built-in",
      "One-click deploy and rollback",
    ],
    isAlternative: false,
  },
];

const stats = [
  { value: "60s", label: "Average time to deploy" },
  { value: "99.9%", label: "Platform uptime" },
  { value: "7", label: "Eval types per agent" },
  { value: "80%", label: "Revenue share" },
];

export function WhyDifferent() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-white/[0.02] to-background" />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            The difference is
            <br />
            <span className="text-foreground-muted">in the details</span>
          </h2>
        </motion.div>

        {/* Comparison Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {comparisons.map((column, colIndex) => (
            <div
              key={column.title}
              className={`rounded-2xl border p-8 ${
                column.isAlternative
                  ? "border-white/5 bg-white/[0.01]"
                  : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <h3 className={`text-sm font-medium uppercase tracking-wider mb-6 ${
                column.isAlternative ? "text-foreground-dim" : "text-white"
              }`}>
                {column.title}
              </h3>
              <ul className="space-y-4">
                {column.items.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: column.isAlternative ? -10 : 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    {column.isAlternative ? (
                      <svg className="h-5 w-5 text-foreground-dim flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 12H6" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-accent-green flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    <span className={column.isAlternative ? "text-foreground-dim" : "text-foreground-body"}>
                      {item}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</div>
              <div className="mt-1 text-sm text-foreground-muted">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
