"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";

const useCases = [
  {
    id: "linkedin",
    title: "LinkedIn Content Agent",
    tagline: "Post daily at 10am",
    description: "An agent that researches trending topics, generates professional content, and auto-posts to LinkedIn on your schedule.",
    trigger: "Schedule: Daily at 10:00 AM",
    integrations: ["LinkedIn API", "Web Search", "Content Generator"],
    flow: [
      { step: "Research", desc: "Searches latest news on your topics" },
      { step: "Generate", desc: "Writes engaging, on-brand content" },
      { step: "Post", desc: "Publishes to LinkedIn automatically" },
    ],
    icon: (
      <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
    gradient: "from-[#0A66C2] to-accent-blue",
  },
  {
    id: "meeting-prep",
    title: "Meeting Prep Agent",
    tagline: "Before every meeting",
    description: "Automatically researches attendees, gathers context from your CRM and emails, and delivers a briefing before each meeting.",
    trigger: "Event: 1 hour before calendar meetings",
    integrations: ["Google Calendar", "LinkedIn", "Gmail", "Salesforce", "Slack"],
    flow: [
      { step: "Detect", desc: "Monitors your calendar for meetings" },
      { step: "Research", desc: "Gathers info on attendees & companies" },
      { step: "Brief", desc: "Sends prep notes to Slack or email" },
    ],
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    gradient: "from-accent-green to-accent-cyan",
  },
  {
    id: "support",
    title: "Customer Support Agent",
    tagline: "24/7 ticket handling",
    description: "Handles support tickets, checks order status, processes refunds, and escalates complex issues to your team.",
    trigger: "Event: New support ticket",
    integrations: ["Zendesk", "Shopify", "Stripe", "Slack"],
    flow: [
      { step: "Receive", desc: "Monitors for new support requests" },
      { step: "Resolve", desc: "Handles common issues automatically" },
      { step: "Escalate", desc: "Routes complex cases to humans" },
    ],
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    gradient: "from-accent-blue to-accent-purple",
  },
  {
    id: "research",
    title: "Research Agent",
    tagline: "Deep dive on demand",
    description: "Researches competitors, market trends, or any topic. Synthesizes information from multiple sources into actionable reports.",
    trigger: "On-demand or scheduled",
    integrations: ["Web Search", "News APIs", "Document Analysis", "Notion"],
    flow: [
      { step: "Query", desc: "Understands your research question" },
      { step: "Gather", desc: "Searches multiple sources in parallel" },
      { step: "Report", desc: "Compiles findings into a structured doc" },
    ],
    icon: (
      <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    gradient: "from-accent-purple to-accent-pink",
  },
];

export function UseCases() {
  const [activeCase, setActiveCase] = useState("linkedin");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const activeUseCase = useCases.find((uc) => uc.id === activeCase);

  return (
    <section ref={ref} id="use-cases" className="relative py-16 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-accent-blue/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-0 w-[400px] h-[400px] bg-accent-purple/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="nm-extruded-sm inline-flex items-center gap-2 px-4 py-2 mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-accent-purple animate-pulse" />
            <span className="text-sm text-foreground-muted">Real-World Agents</span>
          </motion.div>

          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            <span className="text-foreground">Agents that run </span>
            <span className="gradient-text">your workflows</span>
          </h2>
          <p className="text-lg text-foreground-body max-w-2xl mx-auto">
            Schedule them, trigger them on events, or call them on-demand.
            <span className="text-accent-cyan"> Connect to any app, any API. No limits.</span>
          </p>
        </motion.div>

        {/* Use Case Selector - Neumorphic tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="nm-inset p-1.5 mb-8"
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5">
            {useCases.map((uc, i) => (
              <motion.button
                key={uc.id}
                onClick={() => setActiveCase(uc.id)}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`relative p-3 text-left transition-all duration-300 ${
                  activeCase === uc.id
                    ? "nm-extruded-sm"
                    : "hover:bg-white/[0.02]"
                }`}
              >
                {/* Active indicator glow */}
                {activeCase === uc.id && (
                  <motion.div
                    layoutId="useCaseGlow"
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${uc.gradient} opacity-10`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`nm-extruded-sm w-8 h-8 flex items-center justify-center transition-colors duration-300 ${
                        activeCase === uc.id ? "text-accent-cyan" : "text-foreground-muted"
                      }`}
                    >
                      <div className="w-4 h-4">{uc.icon}</div>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activeCase === uc.id
                        ? "bg-accent-cyan/20 text-accent-cyan"
                        : "bg-white/5 text-foreground-dim"
                    }`}>
                      {uc.integrations.length} apps
                    </span>
                  </div>
                  <h3 className={`text-xs font-semibold mb-0.5 transition-colors duration-300 ${
                    activeCase === uc.id ? "text-foreground" : "text-foreground-muted"
                  }`}>
                    {uc.title}
                  </h3>
                  <p className="text-[10px] text-foreground-dim">{uc.tagline}</p>
                </div>

                {/* Active dot indicator */}
                {activeCase === uc.id && (
                  <motion.div
                    layoutId="activeDot"
                    className="absolute bottom-3 right-3 w-2 h-2 rounded-full bg-accent-cyan"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Active Use Case Detail Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCase}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="card-hybrid overflow-hidden"
          >
            <div className="grid lg:grid-cols-2">
              {/* Left - Description */}
              <div className="p-5 lg:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`nm-extruded w-11 h-11 flex items-center justify-center text-accent-cyan`}>
                    {activeUseCase?.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{activeUseCase?.title}</h3>
                    <p className="text-xs text-foreground-muted">{activeUseCase?.tagline}</p>
                  </div>
                </div>

                <p className="text-sm text-foreground-body leading-relaxed mb-4">
                  {activeUseCase?.description}
                </p>

                {/* Trigger badge */}
                <div className="nm-inset-sm inline-flex items-center gap-2 px-3 py-1.5 mb-4">
                  <svg className="w-3.5 h-3.5 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs text-foreground-muted">{activeUseCase?.trigger}</span>
                </div>

                {/* Integrations */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-[10px] text-foreground-dim uppercase tracking-wider">Connects to</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-cyan/20 text-accent-cyan font-medium">
                      {activeUseCase?.integrations.length} apps
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {activeUseCase?.integrations.map((integration) => (
                      <span
                        key={integration}
                        className="nm-extruded-sm px-2 py-1 text-[10px] text-foreground-muted"
                      >
                        {integration}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right - Flow Visualization */}
              <div className="p-5 lg:p-6 bg-background-elevated/50 border-t lg:border-t-0 lg:border-l border-background-border">
                <p className="text-[10px] text-foreground-dim mb-4 uppercase tracking-wider">How it works</p>

                <div className="space-y-4">
                  {activeUseCase?.flow.map((item, i) => (
                    <motion.div
                      key={item.step}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-start gap-3"
                    >
                      <div className="relative">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-accent-cyan border border-accent-cyan/30 bg-accent-cyan/10">
                          {i + 1}
                        </div>
                        {i < (activeUseCase?.flow.length || 0) - 1 && (
                          <div className="absolute top-9 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-gradient-to-b from-accent-cyan/30 to-transparent" />
                        )}
                      </div>
                      <div className="pt-1">
                        <h4 className="text-xs font-semibold text-foreground mb-0.5">{item.step}</h4>
                        <p className="text-xs text-foreground-muted">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Result indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 nm-extruded-sm flex items-center gap-2 px-3 py-2.5 bg-accent-green/5 border border-accent-green/20"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-green/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-accent-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-xs text-accent-green font-medium">Runs automatically</span>
                    <span className="text-[10px] text-foreground-dim block">Monitored 24/7 with full tracing</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
