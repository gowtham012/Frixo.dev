"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { siteConfig } from "@/components/ui/flickering-footer";

export function CTASection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="waitlist" ref={ref} className="relative py-20 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-accent-cyan/8 rounded-full blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
        {/* Main CTA card - Scale up from center */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="nm-extruded p-8 sm:p-10 text-center relative overflow-hidden"
        >
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-3">
            <span className="text-foreground">Describe It.</span>{" "}
            <span className="gradient-text">We Build It.</span>
          </h2>

          <p className="text-foreground-muted text-sm mb-6">
            Production-ready agents. <span className="text-accent-green">You approve every change.</span>
          </p>

          {/* Email form */}
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            onSubmit={handleSubmit}
            className="max-w-md mx-auto mb-6"
          >
            <div className="nm-inset p-1.5 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="nm-input flex-1 h-11 px-4 text-sm"
                disabled={status === "loading" || status === "success"}
              />
              <button
                type="submit"
                className="btn-hybrid h-11 px-6 text-sm whitespace-nowrap"
                disabled={status === "loading" || status === "success"}
              >
                {status === "loading" ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Joining...
                  </span>
                ) : status === "success" ? (
                  <span className="flex items-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    You&apos;re in!
                  </span>
                ) : (
                  "Join Waitlist"
                )}
              </button>
            </div>
          </motion.form>

          {status === "error" && (
            <p className="mb-4 text-sm text-red-400">
              Something went wrong. Please try again.
            </p>
          )}

          {/* Links - inline */}
          <div className="flex items-center justify-center gap-4 text-xs text-foreground-dim">
            <a
              href={siteConfig.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-cyan transition-colors flex items-center gap-1"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              GitHub
            </a>
            <span className="text-foreground-dim/30">•</span>
            <a href="/docs" className="hover:text-accent-cyan transition-colors">
              Docs
            </a>
            <span className="text-foreground-dim/30">•</span>
            <a
              href={siteConfig.social.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-cyan transition-colors"
            >
              Discord
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
