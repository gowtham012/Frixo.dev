"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Free",
    description: "SDK Only",
    price: { monthly: "$0", annual: "$0" },
    period: "forever",
    features: {
      "SDK Access": true,
      "Hosted Agents": "—",
      "Executions/mo": "—",
      "Self-Evolution": "—",
      "A2A Orchestration": "—",
      "Marketplace Selling": false,
      "Eval Storage": "7 days",
      "Support": "Community",
      "SLA": "—",
    },
    cta: "Download SDK",
    href: "https://github.com/getpitlanes",
    gradient: "from-foreground-dim to-foreground-muted",
  },
  {
    name: "Pro",
    description: "For individuals",
    price: { monthly: "$99", annual: "$79" },
    period: "/month",
    popular: true,
    features: {
      "SDK Access": true,
      "Hosted Agents": "10",
      "Executions/mo": "10,000",
      "Self-Evolution": "Basic",
      "A2A Orchestration": "3 agents",
      "Marketplace Selling": true,
      "Eval Storage": "30 days",
      "Support": "Email",
      "SLA": "99.5%",
    },
    cta: "Start Pro Trial",
    href: "#waitlist",
    gradient: "from-accent-blue to-accent-cyan",
  },
  {
    name: "Team",
    description: "For teams",
    price: { monthly: "$299", annual: "$239" },
    period: "/month",
    features: {
      "SDK Access": true,
      "Hosted Agents": "50",
      "Executions/mo": "100,000",
      "Self-Evolution": "Advanced",
      "A2A Orchestration": "20 agents",
      "Marketplace Selling": true,
      "Eval Storage": "90 days",
      "Support": "Priority",
      "SLA": "99.9%",
    },
    cta: "Start Team Trial",
    href: "#waitlist",
    gradient: "from-accent-cyan to-accent-purple",
  },
  {
    name: "Enterprise",
    description: "Custom solutions",
    price: { monthly: "Custom", annual: "Custom" },
    period: "",
    features: {
      "SDK Access": true,
      "Hosted Agents": "Unlimited",
      "Executions/mo": "Unlimited",
      "Self-Evolution": "Full",
      "A2A Orchestration": "Unlimited",
      "Marketplace Selling": true,
      "Eval Storage": "Custom",
      "Support": "Dedicated",
      "SLA": "99.99%",
    },
    cta: "Contact Sales",
    href: "#waitlist",
    gradient: "from-accent-purple to-accent-pink",
  },
];

const addOns = [
  { name: "Additional Agents", price: "$10/mo per agent", icon: "agents" },
  { name: "Additional Executions", price: "$5 per 1,000", icon: "exec" },
  { name: "Additional Team Members", price: "$20/mo per member", icon: "team" },
  { name: "Priority Execution Queue", price: "$100/mo", icon: "priority" },
];

const faqs = [
  {
    question: "What's included in the free tier?",
    answer:
      "The open-source SDK for local development. Full agent creation, eval framework, and testing utilities. No platform hosting.",
  },
  {
    question: "What counts as an execution?",
    answer:
      "One agent run from start to completion. Streaming responses count as one execution regardless of duration.",
  },
  {
    question: "How does self-evolution work?",
    answer:
      "Agents learn from production feedback. The eval flywheel collects data, identifies improvement opportunities, and suggests refinements.",
  },
  {
    question: "What's A2A Orchestration?",
    answer:
      "Agent-to-Agent communication. Agents can discover, authenticate, and collaborate with other agents on the platform.",
  },
  {
    question: "Do you offer annual billing?",
    answer: "Yes, save 20% with annual plans.",
  },
  {
    question: "What compliance certifications do you have?",
    answer:
      "SOC 2 for Pro+, GDPR compliance for Team+, custom certifications for Enterprise.",
  },
];

function PricingCard({
  tier,
  index,
  isAnnual,
}: {
  tier: (typeof pricingTiers)[0];
  index: number;
  isAnnual: boolean;
}) {
  const price = isAnnual ? tier.price.annual : tier.price.monthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`relative ${tier.popular ? "card-hybrid" : "nm-extruded"} p-6 sm:p-8 h-full flex flex-col`}
    >
      {/* Popular badge */}
      {tier.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="nm-extruded-sm inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-accent-cyan">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-cyan animate-pulse" />
            POPULAR
          </span>
        </div>
      )}

      {/* Gradient overlay for popular */}
      {tier.popular && (
        <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 to-accent-purple/5 rounded-3xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="relative">
        <div className={`nm-extruded-sm w-12 h-12 flex items-center justify-center mb-4 relative overflow-hidden`}>
          <div className={`absolute inset-0 bg-gradient-to-br ${tier.gradient} opacity-20`} />
          <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {tier.name === "Free" && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            )}
            {tier.name === "Pro" && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            )}
            {tier.name === "Team" && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            )}
            {tier.name === "Enterprise" && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            )}
          </svg>
        </div>

        <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
        <p className="mt-1 text-sm text-foreground-muted">{tier.description}</p>
      </div>

      {/* Price */}
      <div className="mt-6 mb-6">
        <div className="flex items-baseline gap-1">
          <span className={`text-4xl font-bold bg-gradient-to-r ${tier.gradient} bg-clip-text text-transparent`}>
            {price}
          </span>
          <span className="text-foreground-muted text-sm">{tier.period}</span>
        </div>
        {isAnnual && price !== "$0" && price !== "Custom" && (
          <p className="text-xs text-accent-green mt-2 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Save 20% annually
          </p>
        )}
      </div>

      {/* Features */}
      <div className="nm-inset-sm p-4 flex-1">
        <ul className="space-y-3">
          {Object.entries(tier.features).map(([feature, value]) => (
            <li key={feature} className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">{feature}</span>
              <span className="font-medium">
                {value === true ? (
                  <span className="nm-extruded-sm w-6 h-6 flex items-center justify-center">
                    <svg className="h-4 w-4 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                ) : value === false ? (
                  <span className="nm-inset-sm w-6 h-6 flex items-center justify-center">
                    <svg className="h-4 w-4 text-foreground-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                ) : (
                  <span className="text-foreground">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div className="mt-6">
        <Link
          href={tier.href}
          target={tier.href.startsWith("http") ? "_blank" : undefined}
          className={`w-full flex items-center justify-center gap-2 h-12 ${
            tier.popular
              ? "btn-hybrid"
              : "nm-button text-foreground-muted hover:text-accent-cyan transition-colors"
          }`}
        >
          {tier.cta}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
}

function FAQItem({
  faq,
  index,
}: {
  faq: (typeof faqs)[0];
  index: number;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ margin: "-100px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left ${isOpen ? "nm-extruded-sm" : "nm-button"} p-5 transition-all duration-300`}
      >
        <div className="flex items-center justify-between">
          <span className="text-foreground font-medium pr-4">{faq.question}</span>
          <div className={`nm-extruded-sm w-8 h-8 flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
            <svg className="h-4 w-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="mt-4 text-foreground-body text-sm leading-relaxed border-t border-background-border pt-4">
                {faq.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="pt-24">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-cyan/5 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ delay: 0.1 }}
              className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-accent-green animate-pulse" />
              <span className="text-sm text-foreground-muted">Simple, Transparent Pricing</span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
              <span className="text-foreground">Start Free.</span>
              <br />
              <span className="gradient-text">Scale When Ready.</span>
            </h1>
            <p className="mt-6 text-lg text-foreground-body max-w-2xl mx-auto">
              Open-source SDK for everyone. Managed platform for production.
            </p>

            {/* Billing Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ margin: "-100px" }}
              transition={{ delay: 0.3 }}
              className="mt-10 flex items-center justify-center"
            >
              <div className="nm-inset p-2 flex items-center gap-4">
                <span className={`text-sm px-3 py-1.5 rounded-xl transition-all duration-300 ${
                  !isAnnual ? "nm-extruded-sm text-foreground" : "text-foreground-muted"
                }`}>
                  Monthly
                </span>

                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className="nm-inset relative h-7 w-14 rounded-full overflow-hidden border border-background-border"
                >
                  <div className={`absolute inset-0 bg-gradient-to-r from-accent-cyan to-accent-purple transition-opacity duration-300 ${isAnnual ? "opacity-20" : "opacity-0"}`} />
                  <motion.span
                    className="absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-accent-cyan shadow-lg shadow-accent-cyan/30"
                    style={{ boxShadow: "0 0 10px rgba(0, 245, 212, 0.5), inset 0 1px 2px rgba(255,255,255,0.2)" }}
                    animate={{ x: isAnnual ? 26 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>

                <span className={`text-sm px-3 py-1.5 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                  isAnnual ? "nm-extruded-sm text-foreground" : "text-foreground-muted"
                }`}>
                  Annual
                  <span className="text-xs text-accent-green font-medium">-20%</span>
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative py-12 sm:py-16">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {pricingTiers.map((tier, index) => (
              <PricingCard
                key={tier.name}
                tier={tier}
                index={index}
                isAnnual={isAnnual}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Add-ons */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-accent-purple/5 rounded-full blur-[150px] -translate-y-1/2" />
        </div>

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6">
              <svg className="w-4 h-4 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-foreground-muted">Flexible Options</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Usage-Based Add-Ons
            </h2>
            <p className="mt-4 text-foreground-body">
              Scale individual resources as needed
            </p>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {addOns.map((addon, i) => (
              <motion.div
                key={addon.name}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ margin: "-100px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="nm-extruded p-5 flex items-center gap-4 group hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="nm-extruded-sm w-12 h-12 flex items-center justify-center text-accent-cyan group-hover:text-accent-purple transition-colors">
                  {addon.icon === "agents" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  )}
                  {addon.icon === "exec" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                  {addon.icon === "team" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  )}
                  {addon.icon === "priority" && (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-foreground font-medium">{addon.name}</span>
                </div>
                <span className="nm-inset-sm px-3 py-1.5 text-sm text-accent-cyan font-medium">
                  {addon.price}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent-cyan/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-6">
              <svg className="w-4 h-4 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm text-foreground-muted">Got Questions?</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-accent-cyan/5 rounded-full blur-[200px]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8"
        >
          <div className="nm-extruded p-10 sm:p-14 text-center relative overflow-hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/5 via-transparent to-accent-purple/5 pointer-events-none" />

            <div className="relative">
              {/* Icon */}
              <div className="nm-extruded w-16 h-16 mx-auto mb-8 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-cyan/20 to-accent-purple/20" />
                <svg className="w-8 h-8 text-accent-cyan relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Ready to get started?
              </h2>
              <p className="text-lg text-foreground-body max-w-xl mx-auto mb-10">
                Download the SDK to start building locally, or join the waitlist for
                platform access.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="https://github.com/getpitlanes"
                  target="_blank"
                  className="nm-button h-12 px-6 flex items-center gap-3 text-foreground-muted hover:text-accent-cyan transition-colors group"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium text-sm">Download SDK</span>
                </Link>

                <Link href="/#waitlist" className="btn-hybrid h-12 px-6 flex items-center gap-2 text-sm">
                  Join Waitlist
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
