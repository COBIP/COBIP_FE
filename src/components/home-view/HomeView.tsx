type SetupCard = {
  title: string;
  description: string;
};

const setupCards: SetupCard[] = [
  {
    title: "Next.js 16 App Router",
    description:
      "src/app 기반 구조로 시작해서 이후 라우트와 레이아웃을 확장하기 쉽게 맞췄습니다.",
  },
  {
    title: "TypeScript Ready",
    description:
      "strict 모드와 경로 별칭(@/*)이 포함되어 바로 타입 안전한 작업을 시작할 수 있습니다.",
  },
  {
    title: "Tailwind CSS Built-In",
    description:
      'Next 기본 흐름에 맞춰 Tailwind CSS v4를 연결했고, 전역 스타일은 `globals.css`에서 관리합니다.',
  },
];

const conventionCards: SetupCard[] = [
  {
    title: "Camel Case",
    description: "변수와 함수는 camelCase를 사용하고 함수명은 동사로 시작합니다.",
  },
  {
    title: "Pascal Case",
    description: "컴포넌트와 일반 파일은 PascalCase를 사용합니다.",
  },
  {
    title: "Kebab Case",
    description: "폴더명은 kebab-case를 사용해 구조를 명확히 유지합니다.",
  },
];

export default function HomeView() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-10 px-6 py-10 lg:px-10 lg:py-14">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-surface shadow-[0_24px_80px_rgba(23,33,31,0.08)]">
        <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.5fr_0.9fr] lg:px-10 lg:py-12">
          <div className="space-y-6">
            <span className="inline-flex rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-semibold text-accent-strong">
              COBIP Frontend Starter
            </span>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-accent-strong sm:text-5xl">
                Next.js 16 기반 프론트엔드 개발 환경이 준비되었습니다.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted sm:text-lg">
                TypeScript, Tailwind CSS, App Router, 그리고 `src` 디렉터리
                구조를 기본값으로 맞췄습니다. 이제 기능 단위 컴포넌트와
                라우트를 팀 컨벤션에 맞게 바로 추가하면 됩니다.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-medium text-accent-strong">
              <span className="rounded-full bg-accent-strong px-4 py-2 text-white">
                Next 16.2.3
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                React 19
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                Tailwind CSS v4
              </span>
              <span className="rounded-full border border-border px-4 py-2">
                npm
              </span>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-[#17332c] p-6 text-[#f7f8f2]">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/70">
              Recommended Start
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">Component Path</p>
                <p className="mt-2 font-mono text-sm">
                  src/components/editor-view/EditorView.tsx
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">Route Path</p>
                <p className="mt-2 font-mono text-sm">src/app/dashboard/page.tsx</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-white/70">Alias</p>
                <p className="mt-2 font-mono text-sm">@/components/home-view/HomeView</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {setupCards.map((setupCard) => (
          <article
            key={setupCard.title}
            className="rounded-[1.5rem] border border-border bg-white/80 p-6 shadow-[0_12px_40px_rgba(23,33,31,0.06)] backdrop-blur"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Stack
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-accent-strong">
              {setupCard.title}
            </h2>
            <p className="mt-3 leading-7 text-muted">{setupCard.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-border bg-surface px-6 py-8 shadow-[0_16px_50px_rgba(23,33,31,0.06)] lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              Team Convention
            </p>
            <h2 className="text-3xl font-semibold tracking-[-0.03em] text-accent-strong">
              프로젝트 초기에 바로 지켜야 할 기본 규칙
            </h2>
          </div>
          <p className="max-w-2xl leading-7 text-muted">
            특별 파일인 `page.tsx`, `layout.tsx` 같은 Next.js 예약 파일을 제외한
            일반 파일은 PascalCase를 기준으로 두는 흐름을 추천합니다.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {conventionCards.map((conventionCard) => (
            <article
              key={conventionCard.title}
              className="rounded-[1.5rem] border border-border bg-[#f8f7f1] p-5"
            >
              <h3 className="text-xl font-semibold text-accent-strong">
                {conventionCard.title}
              </h3>
              <p className="mt-3 leading-7 text-muted">
                {conventionCard.description}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
