"use client";

import {
  Header,
  HeroSection,
  HowItWorksSection,
  TemplatesSection,
  ShareSection,
  QuickLinksSection,
  FooterSection,
} from "@/features/main-home/components/Index";
/* ------------------ 메인 페이지 ------------------ */
export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <HowItWorksSection />
      <TemplatesSection />
      <ShareSection />
      <QuickLinksSection />
      <FooterSection />
    </div>
  );
}

