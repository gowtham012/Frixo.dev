"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Guardrails & Recovery",
    description: "Structured outputs, validation, error handling with smart retries. Agents never go off-rails.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "text-accent-cyan",
  },
  {
    title: "Full Tracing",
    description: "See every step: tool calls, LLM invocations, decisions. Track costs per run.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: "text-accent-blue",
  },
  {
    title: "Automated Evals",
    description: "Test suites + production sampling. Regression testing catches prompt drift.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    color: "text-accent-green",
  },
  {
    title: "Enterprise Security",
    description: "Auth/authz for every tool. Audit trails. PII scrubbing built-in.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "text-accent-pink",
  },
  {
    title: "Multi-LLM Failover",
    description: "Automatic failover across providers. If one LLM goes down, your agents keep running seamlessly.",
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: "text-yellow-400",
  },
  {
    title: "Self-Evolution",
    description: "Feedback loops, A/B testing for safe rollouts. You approve every change.",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 6V9L16 5L12 1V4C7.58 4 4 7.58 4 12C4 13.57 4.46 15.03 5.24 16.26L6.7 14.8C6.25 13.97 6 13.01 6 12C6 8.69 8.69 6 12 6ZM18.76 7.74L17.3 9.2C17.75 10.03 18 10.99 18 12C18 15.31 15.31 18 12 18V15L8 19L12 23V20C16.42 20 20 16.42 20 12C20 10.43 19.54 8.97 18.76 7.74Z" />
      </svg>
    ),
    color: "text-accent-cyan",
  },
];

const stats = [
  { value: "6", label: "Prod layers", color: "text-accent-green" },
  { value: "<100ms", label: "Eval latency", color: "text-accent-cyan" },
  { value: "Full", label: "Observability", color: "text-accent-blue" },
  { value: "24/7", label: "Monitoring", color: "text-accent-purple" },
];

export function Features() {
  return (
    <section id="features" className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-80 h-80 bg-accent-purple/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent-cyan/5 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-foreground">You Describe.</span>
            <br />
            <span className="gradient-text">We Handle Production.</span>
          </h2>
          <p className="text-lg text-foreground-body max-w-2xl mx-auto">
            Tell us what your agent should do. We build the complete production stack —
            <span className="text-accent-cyan"> you stay in control.</span>
          </p>
        </motion.div>

        {/* Features Grid - 3 columns, uniform cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="group"
            >
              <div className="nm-extruded h-full p-5 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className={`nm-inset-sm w-11 h-11 flex items-center justify-center flex-shrink-0 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-accent-cyan transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-foreground-muted leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section - Guarantee + Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="nm-extruded p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Platform Guarantee */}
            <div className="flex-1">
              <div className="flex items-start gap-4">
                <div className="nm-inset-sm w-12 h-12 flex items-center justify-center text-accent-green flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">The Platform Guarantee</h3>
                  <p className="text-sm text-foreground-muted">
                    Every output is <span className="text-accent-green">verified</span>, <span className="text-accent-cyan">traceable</span>, and <span className="text-accent-purple">safe</span>. If it doesn&apos;t meet your standards, it doesn&apos;t ship.
                  </p>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden lg:block w-px h-16 bg-background-border" />

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 lg:gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ margin: "-100px" }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="text-center"
                >
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-foreground-dim">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
