import { Hero } from "@/components/landing/hero";
import { AgentFlow3D } from "@/components/landing/agent-flow-3d";
import { CodePreview } from "@/components/landing/code-preview";
import { BuildOptions } from "@/components/landing/build-options";
import { Features } from "@/components/landing/features";
import { Integrations } from "@/components/landing/integrations";
import { UseCases } from "@/components/landing/use-cases";
import { HowItWorks } from "@/components/landing/how-it-works";
import { BackgroundNoiseGradient } from "@/components/ui/background-noise-gradient";

export default function Home() {
  return (
    <div className="relative overflow-x-hidden">
      {/* Global seamless background */}
      <div className="fixed inset-0 -z-10">
        <BackgroundNoiseGradient noiseAlpha={9} />
      </div>
      {/* Hero - Main value proposition */}
      <Hero />

      {/* 3D Agent Flow - Split view showing foreground building and background operations */}
      <AgentFlow3D />

      {/* Build Options - Show both prompt and SDK approaches */}
      <BuildOptions />

      {/* Features - 6 production layers */}
      <Features />

      {/* Integrations - App connections showcase */}
      <Integrations />

      {/* Use Cases - Real-world agents */}
      <UseCases />

      {/* How It Works - Step by step journey */}
      <HowItWorks />
    </div>
  );
}
