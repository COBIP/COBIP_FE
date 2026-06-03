import {
  BadgeCheck,
  BookOpenCheck,
  Bot,
  Code2,
  CreditCard,
  Gauge,
  GraduationCap,
  LayoutDashboard,
  Sparkles,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type PricingPlan = {
  name: "Free" | "Plus" | "Pro";
  price: string;
  description: string;
  badge?: string;
  highlighted?: boolean;
  cta: string;
  features: Array<{
    icon: LucideIcon;
    text: string;
  }>;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: "Free",
    price: "0",
    description: "COBIP의 기본 학습 흐름을 부담 없이 시작할 수 있는 무료 플랜입니다.",
    cta: "무료로 시작하기",
    features: [
      { icon: BookOpenCheck, text: "공개 문법 템플릿 학습" },
      { icon: Code2, text: "기본 코드 실행 환경 이용" },
      { icon: LayoutDashboard, text: "학습 진행률 대시보드 확인" },
      { icon: Sparkles, text: "일부 기능 템플릿 열람" },
    ],
  },
  {
    name: "Plus",
    price: "9,900",
    description: "문법과 기능 템플릿을 꾸준히 학습하는 개인 사용자에게 적합합니다.",
    badge: "추천",
    cta: "Plus 선택하기",
    features: [
      { icon: GraduationCap, text: "문법/기능 템플릿 전체 학습" },
      { icon: Bot, text: "AI 기능 템플릿 생성 한도 확장" },
      { icon: Gauge, text: "미션/문제 실습 진행률 관리" },
      { icon: BadgeCheck, text: "오답과 학습 이력 기반 복습" },
      { icon: Sparkles, text: "AI 코드리뷰 보조 기능 이용" },
    ],
  },
  {
    name: "Pro",
    price: "19,900",
    description: "심화 실습과 AI 보조 기능을 더 적극적으로 활용하는 플랜입니다.",
    badge: "최대 활용",
    highlighted: true,
    cta: "Pro 선택하기",
    features: [
      { icon: Zap, text: "Plus의 모든 기능 포함" },
      { icon: Bot, text: "AI 생성/섹션 재생성 한도 확대" },
      { icon: Code2, text: "고급 실습 템플릿 우선 이용" },
      { icon: LayoutDashboard, text: "상세 학습 리포트 확인" },
      { icon: BadgeCheck, text: "신규 학습 기능 우선 적용" },
      { icon: CreditCard, text: "추후 결제/구독 관리 연동" },
    ],
  },
];
