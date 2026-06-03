"use client";

import { Header } from "@/features/main-home/components/Header";
import { PRICING_PLANS } from "@/features/pricing/Constants";
import { PricingHero } from "@/features/pricing/components/PricingHero";
import { PricingPlanCard } from "@/features/pricing/components/PricingPlanCard";
import { useUserStore } from "@/store/UseUserStore";

export function PricingPage() {
  const { isLoggedIn } = useUserStore();

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Header />

      <main className="mx-auto w-full max-w-[1280px] px-6 py-12">
        <PricingHero />

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <PricingPlanCard key={plan.name} plan={plan} isLoggedIn={isLoggedIn} />
          ))}
        </section>
      </main>
    </div>
  );
}
