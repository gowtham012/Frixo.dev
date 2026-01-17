"use client";

import { motion } from "framer-motion";

const steps = [
  {
    step: "01",
    title: "Describe",
    description: "Tell us what you need in plain English. What should the agent do? Which apps should it connect to?",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    numberClass: "text-accent-cyan/20",
    iconBoxClass: "bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan",
    accentClass: "bg-accent-cyan/30",
  },
  {
    step: "02",
    title: "Review",
    description: "We generate everything: system prompt, tools, eval suite. Review and customize if needed.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    numberClass: "text-accent-purple/20",
    iconBoxClass: "bg-accent-purple/10 border-accent-purple/20 text-accent-purple",
    accentClass: "bg-accent-purple/30",
  },
  {
    step: "03",
    title: "Deploy",
    description: "One click to production. Your agent monitors itself and proposes improvements.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    numberClass: "text-accent-green/20",
    iconBoxClass: "bg-accent-green/10 border-accent-green/20 text-accent-green",
    accentClass: "bg-accent-green/30",
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px]" />
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
            className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6 mx-auto"
          >
            <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
            <span className="text-sm text-foreground-muted">3 Simple Steps</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">Describe. Deploy.</span>
            <br />
            <span className="gradient-text">Watch It Evolve.</span>
          </h2>
        </motion.div>

        {/* Steps - Horizontal Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Card */}
              <div className="nm-extruded h-full p-6 transition-all duration-300 hover:translate-y-[-2px]">
                {/* Top Row - Step number and icon */}
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-4xl font-bold ${step.numberClass}`}>
                    {step.step}
                  </span>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center ${step.iconBoxClass}`}>
                    {step.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-foreground-muted leading-relaxed">
                  {step.description}
                </p>

                {/* Bottom accent line */}
                <div className={`mt-5 h-1 w-12 rounded-full ${step.accentClass}`} />
              </div>

              {/* Arrow connector - Desktop only */}
              {index < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-7 lg:-right-8 -translate-y-1/2 z-10 items-center justify-center w-8 h-8">
                  <motion.svg
                    className="w-5 h-5 text-accent-cyan"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </motion.svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 text-center"
        >
          <p className="text-foreground-muted mb-6">
            Ready to describe your first agent?
          </p>
          <a
            href="#waitlist"
            className="btn-hybrid inline-flex items-center gap-2 text-base px-8 py-4"
          >
            Get Started
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
