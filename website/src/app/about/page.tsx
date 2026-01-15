"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";

const stats = [
  { value: "100%", label: "Open Source SDK" },
  { value: "MIT", label: "License" },
  { value: "24/7", label: "Monitoring" },
  { value: "99.9%", label: "Uptime SLA" },
];

const values = [
  {
    title: "Open Source First",
    description: "Full transparency, no vendor lock-in. Our SDK is MIT-licensed because we believe the best infrastructure is built in the open, with the community.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: "cyan",
    size: "large",
  },
  {
    title: "You Stay in Control",
    description: "Your agents evolve, but nothing ships without your approval. Every change, every improvement — you decide.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "green",
    size: "normal",
  },
  {
    title: "Production Over Prototype",
    description: "Building agents is easy. Running them reliably is hard. We obsess over the hard part so you don't have to.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: "purple",
    size: "normal",
  },
  {
    title: "Developer Experience",
    description: "Complex infrastructure, simple interface. Describe what you need in plain language — we handle the rest. No PhD required.",
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    color: "pink",
    size: "large",
  },
];

const timeline = [
  { year: "2025", event: "Founded with a mission to simplify agent infrastructure" },
  { year: "2025", event: "Platform concept validated with early partners" },
  { year: "2026", event: "Building open-source SDK under MIT license" },
  { year: "2026", event: "Platform launch with A2A Protocol (Coming Soon)" },
];

export default function AboutPage() {
  const heroRef = useRef(null);
  const isHeroInView = useInView(heroRef, { once: true, margin: "-100px" });

  return (
    <div className="pt-24">
      {/* Hero Section - Split Layout */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent-purple/10 rounded-full blur-[200px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent-cyan/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Text */}
            <motion.div
              ref={heroRef}
              initial={{ opacity: 0, x: -30 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6"
              >
                <span className="w-2 h-2 rounded-full bg-accent-cyan animate-pulse" />
                <span className="text-sm text-foreground-muted">About Us</span>
              </motion.div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                <span className="text-foreground">Making AI Agents</span>
                <br />
                <span className="gradient-text">Production Ready</span>
              </h1>

              <p className="text-lg text-foreground-body leading-relaxed mb-8">
                One prompt. Any agent. We're building the all-in-one platform with integrated
                evals, tracing, A2A, memory, and multi-LLM fallback. Self-evolving agents.
                Deploy with one click. Sell on our marketplace.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/#waitlist" className="btn-hybrid h-12 px-6 flex items-center gap-2 text-sm">
                  Join Waitlist
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="https://github.com/frixo-dev"
                  target="_blank"
                  className="nm-button h-12 px-6 flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  View GitHub
                </Link>
              </div>
            </motion.div>

            {/* Right - Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isHeroInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="nm-extruded p-6 text-center group hover:scale-[1.02] transition-transform"
                >
                  <div className="text-3xl sm:text-4xl font-bold gradient-text mb-2">{stat.value}</div>
                  <div className="text-sm text-foreground-muted">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Statement - Full Width Banner */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="nm-inset p-8 sm:p-12 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-accent-cyan/5 via-accent-purple/5 to-accent-pink/5" />
            <div className="relative z-10 text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl text-foreground font-medium leading-relaxed max-w-4xl mx-auto">
                "One platform to
                <span className="gradient-text"> build, guard, trace, eval, deploy, and evolve</span>
                {" "}your AI agents. Stop stitching tools. Start shipping."
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values - Bento Grid */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
              <span className="text-sm text-foreground-muted">What We Believe</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Our Core Values</h2>
          </motion.div>

          {/* Bento Grid Layout - Row 1: large+normal, Row 2: normal+large */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`nm-extruded p-6 group hover:scale-[1.02] transition-all duration-300 ${
                  value.size === "large" ? "md:col-span-2" : ""
                }`}
              >
                <div className={`nm-inset w-12 h-12 flex items-center justify-center mb-4 ${
                  value.color === "cyan" ? "text-accent-cyan" :
                  value.color === "green" ? "text-accent-green" :
                  value.color === "purple" ? "text-accent-purple" :
                  "text-accent-pink"
                }`}>
                  {value.icon}
                </div>
                <h3 className={`text-xl font-semibold mb-2 transition-colors ${
                  value.color === "cyan" ? "group-hover:text-accent-cyan" :
                  value.color === "green" ? "group-hover:text-accent-green" :
                  value.color === "purple" ? "group-hover:text-accent-purple" :
                  "group-hover:text-accent-pink"
                }`}>
                  {value.title}
                </h3>
                <p className="text-foreground-muted text-sm leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story + Timeline */}
      <section className="relative py-16 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Story Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="nm-extruded p-8 sm:p-10"
            >
              <div className="nm-inset-sm inline-flex items-center gap-2 px-3 py-1.5 mb-6">
                <span className="text-xs text-foreground-muted uppercase tracking-wider">Our Story</span>
              </div>
              <div className="space-y-4 text-foreground-body leading-relaxed">
                <p>
                  We built Frixo because we saw teams spending months on infrastructure
                  that had nothing to do with their core product.
                </p>
                <p>
                  Auth systems, eval pipelines, monitoring dashboards — the same components,
                  reimplemented hundreds of times.
                </p>
                <p className="text-accent-cyan font-medium">
                  We're solving this once, so you can focus on what matters: your agents.
                </p>
              </div>
            </motion.div>

            {/* Timeline Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="nm-extruded p-8 sm:p-10"
            >
              <div className="nm-inset-sm inline-flex items-center gap-2 px-3 py-1.5 mb-6">
                <span className="text-xs text-foreground-muted uppercase tracking-wider">Timeline</span>
              </div>
              <div className="space-y-6">
                {timeline.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-accent-cyan" />
                      {i < timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gradient-to-b from-accent-cyan/50 to-transparent mt-2" />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="text-sm font-medium text-accent-cyan mb-1">{item.year}</div>
                      <div className="text-foreground-muted text-sm">{item.event}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Open Source CTA */}
      <section className="relative py-16 sm:py-24">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card-hybrid p-10 sm:p-14 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/10 via-transparent to-accent-purple/10" />

            <div className="relative z-10">
              <div className="nm-extruded w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-accent-cyan" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Open Source & Transparent
              </h2>
              <p className="text-foreground-body max-w-xl mx-auto mb-8">
                Our SDK is fully open-source under MIT. Contribute, fork, or learn from the code.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="https://github.com/frixo-dev"
                  target="_blank"
                  className="btn-hybrid h-12 px-6 flex items-center gap-2 text-sm"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Star on GitHub
                </Link>
                <Link
                  href="/docs"
                  className="nm-button h-12 px-6 flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
                >
                  Read Documentation
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact - Minimal */}
      <section className="relative py-16">
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">Get in Touch</h2>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href="mailto:hello@frixo.dev"
                className="nm-button h-10 px-4 flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </a>
              <a
                href="https://twitter.com/frixodev"
                target="_blank"
                rel="noopener noreferrer"
                className="nm-button h-10 px-4 flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                Twitter
              </a>
              <a
                href="https://discord.gg/frixo"
                target="_blank"
                rel="noopener noreferrer"
                className="nm-button h-10 px-4 flex items-center gap-2 text-sm text-foreground-muted hover:text-accent-cyan transition-colors"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
