"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const pricingTiers = [
  {
    name: "Open Source",
    description: "Free forever",
    price: "$0",
    features: ["Full SDK access", "Local development", "Community support", "Unlimited agents"],
    cta: "Get Started",
    ctaHref: "https://github.com/frixo-dev/sdk",
    highlighted: false,
  },
  {
    name: "Pro",
    description: "For production workloads",
    price: "$99",
    period: "/mo",
    features: ["Everything in Open Source", "Managed hosting", "Production evals", "Priority support", "99.9% SLA"],
    cta: "Join Waitlist",
    ctaHref: "#waitlist",
    highlighted: true,
  },
  {
    name: "Enterprise",
    description: "Custom solutions",
    price: "Custom",
    features: ["Everything in Pro", "Dedicated infrastructure", "SSO/SAML", "Custom compliance", "Dedicated support"],
    cta: "Contact Sales",
    ctaHref: "/contact",
    highlighted: false,
  },
];

export function PricingPreview() {
  const headerRef = useRef(null);
  const isHeaderInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section className="relative py-32">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Simple, transparent
            <br />
            <span className="text-foreground-muted">pricing</span>
          </h2>
          <p className="mt-4 text-foreground-muted">
            Start free with our open-source SDK. Scale with managed infrastructure when you&apos;re ready.
          </p>
        </motion.div>

        {/* Pricing Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                tier.highlighted
                  ? "border-white/20 bg-white/[0.04]"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-3 left-6 px-3 py-1 text-xs font-medium bg-white text-background rounded-full">
                  Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white">{tier.name}</h3>
                <p className="text-sm text-foreground-muted">{tier.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">{tier.price}</span>
                {tier.period && <span className="text-foreground-muted">{tier.period}</span>}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <svg className="h-5 w-5 text-foreground-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-foreground-body">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link href={tier.ctaHref}>
                <Button
                  className={`w-full rounded-xl h-12 ${
                    tier.highlighted
                      ? "bg-white hover:bg-white/90 text-background"
                      : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                  }`}
                >
                  {tier.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isHeaderInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center text-sm text-foreground-dim"
        >
          All plans include unlimited team members and API access
        </motion.p>
      </div>
    </section>
  );
}
