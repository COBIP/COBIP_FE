import { createElement } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import type { PricingPlan } from "@/features/pricing/Constants";

interface PricingPlanCardProps {
  plan: PricingPlan;
  isLoggedIn: boolean;
}

export function PricingPlanCard({ plan, isLoggedIn }: PricingPlanCardProps) {
  const ctaHref = isLoggedIn ? "/my-page/dashboard" : "/login";
  const href = plan.name === "Free" && !isLoggedIn ? "/signup" : ctaHref;
  const ctaLabel = plan.name === "Free" && isLoggedIn ? "학습하러 가기" : plan.cta;

  return (
    <article
      className={`flex min-h-[620px] flex-col rounded-lg border p-6 transition ${
        plan.highlighted
          ? "border-[#C4B5FD] bg-[#F5F3FF] shadow-sm"
          : "border-[#E2E8F0] bg-white"
      }`}
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1E293B]">{plan.name}</h2>
          <p className="mt-3 text-sm leading-6 text-[#64748B]">{plan.description}</p>
        </div>
        {plan.badge && (
          <span
            className={`shrink-0 rounded-lg px-3 py-1 text-xs font-semibold ${
              plan.highlighted
                ? "bg-white text-[#7C3AED]"
                : "bg-[#F5F3FF] text-[#6D28D9]"
            }`}
          >
            {plan.badge}
          </span>
        )}
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-2">
          <span className="text-sm font-semibold text-[#94A3B8]">₩</span>
          <strong className="text-[40px] font-bold leading-none tracking-tight text-[#111827]">
            {plan.price}
          </strong>
          <span className="pb-1 text-sm text-[#64748B]">/ 월</span>
        </div>
        <p className="mt-2 text-xs text-[#94A3B8]">VAT 포함 금액입니다.</p>
      </div>

      <Link
        href={href}
        className={`mb-6 flex h-12 items-center justify-center rounded-lg text-sm font-semibold transition ${
          plan.highlighted
            ? "bg-[#7C3AED] text-white hover:bg-[#6D28D9]"
            : "border border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#C4B5FD] hover:bg-[#F8FAFC]"
        }`}
      >
        {ctaLabel}
      </Link>

      <div className="space-y-4">
        {plan.features.map((feature) => (
          <div key={feature.text} className="flex gap-3 text-sm leading-6 text-[#334155]">
            {createElement(feature.icon, {
              className: "mt-0.5 h-4 w-4 shrink-0 text-[#7C3AED]",
            })}
            <span>{feature.text}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-8">
        <div className="rounded-lg bg-white/70 p-3 text-xs leading-5 text-[#64748B]">
          <div className="flex items-center gap-2 font-semibold text-[#475569]">
            <Check className="h-4 w-4 text-emerald-600" />
            언제든 플랜을 변경할 수 있어요.
          </div>
          <p className="mt-1">결제 기능은 추후 백엔드 구독 API와 연결될 예정입니다.</p>
        </div>
      </div>
    </article>
  );
}
