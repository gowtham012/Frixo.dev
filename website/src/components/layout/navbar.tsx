"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LogoDark } from "@/components/ui/logo";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState("");
  const pathname = usePathname();

  // Check if a link is active based on current pathname
  const isLinkActive = (href: string) => {
    if (href.startsWith("/#")) {
      // For hash links, only active on home page
      return pathname === "/" && href.includes(pathname);
    }
    return pathname === href || pathname.startsWith(href + "/");
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8"
    >
      <div className="mx-auto max-w-6xl">
        <motion.div
          className={`mt-4 transition-all duration-500 ${isScrolled
            ? "nm-extruded-sm"
            : "bg-transparent"
            }`}
          style={{
            borderRadius: isScrolled ? "20px" : "0px",
          }}
        >
          <div className="relative flex h-16 items-center justify-between px-6">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <LogoDark size="md" />
              </motion.div>
            </Link>

            {/* Desktop Navigation - absolutely centered */}
            <div className="hidden md:flex items-center justify-center absolute left-1/2 -translate-x-1/2">
              <div className="nm-inset-sm flex items-center gap-1 p-1">
                {navLinks.map((link) => {
                  const isActive = isLinkActive(link.href);
                  const isHovered = hoveredLink === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onMouseEnter={() => setHoveredLink(link.href)}
                      onMouseLeave={() => setHoveredLink("")}
                      className="relative px-4 py-2 text-sm transition-all duration-300"
                    >
                      {/* Active/Hover background */}
                      <motion.div
                        className={`absolute inset-0 rounded-lg ${isActive
                          ? "bg-accent-cyan/15"
                          : "bg-gradient-to-r from-accent-cyan/10 to-accent-purple/10"
                          }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isActive || isHovered ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />

                      <span className={`relative z-10 ${isActive
                        ? "text-accent-cyan font-medium"
                        : isHovered
                          ? "text-accent-cyan"
                          : "text-foreground-muted hover:text-foreground"
                        }`}>
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
              <Link
                href="https://github.com/getpitlanes"
                target="_blank"
                rel="noopener noreferrer"
                className="group"
              >
                <motion.div
                  className="nm-button px-4 py-2 flex items-center gap-2 text-sm text-foreground-muted group-hover:text-foreground"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                  Star
                </motion.div>
              </Link>

              <motion.button
                className="btn-hybrid text-sm whitespace-nowrap"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="flex items-center gap-2">
                  Join Waitlist
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden nm-button p-2.5"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <svg className="h-5 w-5 text-foreground-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  initial={false}
                  animate={{ d: isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16" }}
                  transition={{ duration: 0.3 }}
                />
              </svg>
            </motion.button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="md:hidden overflow-hidden"
              >
                <div className="px-4 pb-6 pt-2">
                  <div className="nm-inset p-2 space-y-1">
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={link.href}
                          className="block px-4 py-3 text-foreground-muted hover:text-accent-cyan transition-colors rounded-xl hover:bg-accent-cyan/5"
                          onClick={() => setIsOpen(false)}
                        >
                          {link.label}
                        </Link>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-background-border space-y-3">
                    <Link
                      href="https://github.com/getpitlanes"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="nm-button flex items-center justify-center gap-2 py-3 text-foreground-muted"
                      onClick={() => setIsOpen(false)}
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      Star on GitHub
                    </Link>
                    <motion.button
                      className="btn-hybrid w-full py-3 text-sm"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setIsOpen(false)}
                    >
                      Join Waitlist
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.nav>
  );
}
