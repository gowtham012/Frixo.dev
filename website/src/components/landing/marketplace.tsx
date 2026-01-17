"use client";

import { motion } from "framer-motion";

export function Marketplace() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px]" />
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
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
            <span className="text-sm text-foreground-muted">Coming Soon</span>
          </motion.div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            <span className="text-foreground">The Agent </span>
            <span className="gradient-text">Marketplace</span>
          </h2>
          <p className="mt-4 text-foreground-body max-w-2xl mx-auto">
            Discover production-ready agents or monetize your own creations.
            <span className="text-accent-cyan"> Be among the first creators when we launch.</span>
          </p>
        </motion.div>

        {/* Buy & Sell Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Buy Agents Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="nm-extruded p-6 relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="nm-extruded-sm w-14 h-14 flex items-center justify-center text-accent-cyan">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Discover Agents</h3>
                  <p className="text-sm text-foreground-muted">Skip the build, start automating</p>
                </div>
              </div>
              <p className="text-foreground-body mb-4">
                Find production-ready agents built by the community. One-click install, instant automation.
                Every agent comes with full documentation and support.
              </p>
              <ul className="space-y-2">
                {["Verified & tested agents", "Instant deployment", "Full customization access"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
                    <span className="w-5 h-5 rounded-full bg-accent-cyan/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Sell Agents Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="nm-extruded p-6 relative overflow-hidden group hover:translate-y-[-2px] transition-transform duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="nm-extruded-sm w-14 h-14 flex items-center justify-center text-accent-purple">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Sell Agents</h3>
                  <p className="text-sm text-foreground-muted">Monetize your creations</p>
                </div>
              </div>
              <p className="text-foreground-body mb-4">
                Built an amazing agent? List it on our marketplace and earn recurring revenue.
                We handle payments, licensing, and distribution.
              </p>
              <ul className="space-y-2">
                {["Keep 80% of revenue", "Built-in analytics", "Global distribution"].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-foreground-muted">
                    <span className="w-5 h-5 rounded-full bg-accent-purple/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <p className="text-foreground-muted mb-6">
            Be among the first creators on the marketplace
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#waitlist"
              className="btn-hybrid inline-flex items-center gap-2 text-base px-8 py-4"
            >
              Join Creator Waitlist
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="#use-cases"
              className="nm-extruded-sm inline-flex items-center gap-2 text-base px-8 py-4 text-foreground-muted hover:text-foreground transition-colors"
            >
              Explore Use Cases
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
