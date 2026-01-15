import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/ui/flickering-footer";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Frixo.dev | One Prompt. Any Agent.",
  description:
    "Build any AI agent from one prompt. Integrated evals, tracing, A2A, memory, multi-LLM fallback. Self-evolving agents. Deploy with one click. Sell on our marketplace. The all-in-one platform.",
  keywords: [
    "AI agents",
    "AI agent platform",
    "build AI agents",
    "agent marketplace",
    "self-evolving agents",
    "agent tracing",
    "agent evals",
    "A2A protocol",
    "agent-to-agent",
    "multi-LLM",
    "agent memory",
    "agent deployment",
    "LangChain alternative",
    "Frixo.dev",
  ],
  authors: [{ name: "Frixo.dev" }],
  openGraph: {
    title: "Frixo.dev | One Prompt. Any Agent.",
    description:
      "Build any agent from one prompt. Self-evolving agents. Integrated evals, tracing, A2A, memory. Deploy and sell on marketplace.",
    type: "website",
    siteName: "Frixo.dev",
  },
  twitter: {
    card: "summary_large_image",
    title: "Frixo.dev | One Prompt. Any Agent.",
    description:
      "Build any AI agent from one prompt. Self-evolving. Integrated evals, tracing, A2A, memory. Deploy. Sell on marketplace.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent-blue focus:text-background focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
