import type { Metadata } from "next";
import { HeroSection } from "@/components/home/HeroSection";
import { ToolsLogoCloud } from "@/components/home/ToolsLogoCloud";
import { WorkflowPreviewSection } from "@/components/home/WorkflowPreviewSection";
import { ExtensionShowcaseSection } from "@/components/home/ExtensionShowcaseSection";
import { FourPastelFeaturesSection } from "@/components/home/FourPastelFeaturesSection";
import { DarkVelocitySection } from "@/components/home/DarkVelocitySection";
import { RoomToThinkSection } from "@/components/home/RoomToThinkSection";
import { IntegrationsSection } from "@/components/home/IntegrationsSection";
import { DurationPlansSection } from "@/components/home/DurationPlansSection";
import { KnowledgeIdeasSection } from "@/components/home/KnowledgeIdeasSection";
import { HomeFaqSection } from "@/components/home/HomeFaqSection";
import { HomeFinalCta } from "@/components/home/HomeFinalCta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Orbyt Rush | Less Busywork. More Velocity.",
  description:
    "Flexible on-demand access to premium SEO, content, and research tools for 1, 3, 7, or 30 days. Pay in PKR, launch in 1-click on Orbyt Rush.",
};

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <ToolsLogoCloud />
      <WorkflowPreviewSection />
      <ExtensionShowcaseSection />
      <FourPastelFeaturesSection />
      <DarkVelocitySection />
      <RoomToThinkSection />
      <IntegrationsSection />
      <DurationPlansSection />
      <KnowledgeIdeasSection />
      <HomeFaqSection />
      <HomeFinalCta />
    </>
  );
}
