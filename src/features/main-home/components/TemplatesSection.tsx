import { useEffect, useState } from "react";
import { Code, Layers, Sparkles, Loader2, Lightbulb } from "lucide-react";
import { useRouter } from "next/navigation";
import { grammarTemplateService } from "@/api/services/GrammarTemplateService";
import { useUserStore } from '@/store/UseUserStore';
import type { GrammarTemplateItem } from "@/features/grammar-template/Constants";

/** 언어별 아이콘 */
const LANGUAGE_ICONS: Record<string, string> = {
  PYTHON: '🐍',
  JAVA: '☕',
  JAVASCRIPT: '🟨',
};

export function TemplatesSection() {
  const router = useRouter();
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const [templates, setTemplates] = useState<GrammarTemplateItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const requireAuth = (path: string) => {
    if (!isLoggedIn) {
      router.push('/login');
    } else {
      router.push(path);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }
    let isCancelled = false;
    const fetchData = async () => {
      try {
        const result = await grammarTemplateService.getTemplates({ page: 0, size: 8 });
        if (!isCancelled) setTemplates(result.content);
      } catch {
        if (!isCancelled) setTemplates([]);
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    fetchData();
    return () => { isCancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            다양한 템플릿을 제공합니다
          </h2>
          <p className="text-gray-500 text-lg">
            두 가지 템플릿 방식으로 유연하게 학습하세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 문법 템플릿 */}
          <div
            onClick={() => requireAuth('/grammar-template')}
            className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">문법 템플릿</h3>
            <p className="text-gray-500 text-sm mb-4">
              특정 언어나 프레임워크의 문법을 집중적으로 학습할 수 있어요.
              <br />
              기초부터 심화까지 체계적으로 정리되어 있어요.
            </p>
            <div className="flex flex-wrap gap-2">
              {["Python", "Java", "JavaScript"].map((lang) => (
                <span
                  key={lang}
                  className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full"
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* 기능 템플릿 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <Layers className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">기능 템플릿</h3>
            <p className="text-gray-500 text-sm mb-4">
              실제 기능 단위로 구성된 템플릿으로 실무 감각을 익혀요.
              <br />
              설계 의도 → 소스 코드 → 미션까지 한 번에!
            </p>
            <div className="flex flex-wrap gap-2">
              {["JWT 로그인", "Redis 캐싱", "결제 시스템", "파일 업로드", "채팅", "알림"].map(
                (feat) => (
                  <span
                    key={feat}
                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2.5 py-1 rounded-full"
                  >
                    {feat}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* ── 실제 화면 미리보기: 문법 템플릿 ── */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">📖 문법 템플릿 살펴보기</h3>
            <p className="text-gray-500">코드 한 줄 한 줄을 시각화하며 학습할 수 있어요</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {templates.slice(0, 4).map((t) => (
                <div
                  key={t.id}
                  onClick={() => requireAuth(`/grammar-template/${t.id}`)}
                  className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-purple-200 transition-all cursor-pointer"
                >
                  <div className="text-2xl mb-2">{LANGUAGE_ICONS[t.language] || '📄'}</div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{t.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{t.summary}</p>
                  <div className="flex gap-1 mt-2">
                    <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">{t.category}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 실제 화면 미리보기: 기능 템플릿 ── */}
        <div className="mt-16">
          <div className="text-center mb-10">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">🛠️ 기능 템플릿 살펴보기</h3>
            <p className="text-gray-500">설계 의도부터 소스 코드, 미션까지 단계별로 학습해요</p>
          </div>

          <FunctionalPreviewMockup />
        </div>

        {/* AI 생성 CTA */}
        <div className="mt-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 md:p-10 text-center text-white">
          <Sparkles className="w-10 h-10 mx-auto mb-4" />
          <h3 className="text-2xl md:text-3xl font-bold mb-2">
            원하는 템플릿이 없나요?
          </h3>
          <p className="text-white/80 mb-6 max-w-lg mx-auto">
            &ldquo;React + Spring을 활용한 로그인 기능을 만들고 싶어요&rdquo; 라고 입력하면
            <br />
            AI가 맞춤형 템플릿을 생성해드려요
          </p>
          <button className="bg-white text-purple-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-purple-50 transition cursor-pointer">
            AI 템플릿 생성하기
          </button>
        </div>
      </div>
    </section>
  );
}

/* 기능 템플릿 미리보기 목업 */
function FunctionalPreviewMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-48 bg-gray-50 border-r border-gray-100 p-4 shrink-0">
          <div className="space-y-1">
            {[
              { icon: "💡", label: "설계 의도", active: true },
              { icon: "📦", label: "요구사항", active: false },
              { icon: "📂", label: "구조", active: false },
              { icon: "📄", label: "소스 코드", active: false },
              { icon: "🎯", label: "미션 / 문제", active: false },
              { icon: "💬", label: "인터뷰", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm transition cursor-pointer ${
                  item.active
                    ? "bg-purple-100 text-purple-700 font-medium"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-purple-600" />
            <h4 className="text-lg font-bold text-gray-900">설계 의도</h4>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              이 템플릿은 <strong className="text-gray-900">사용자 인증 시스템</strong>의 기본 구조를 보여줍니다.
              <br />
              JWT(Json Web Token)와 Redis를 활용하여 access token과 refresh token을
              <br />
              안전하게 관리하는 로그인 기능을 구현합니다.
            </p>
          </div>

          <div className="flex gap-1 mb-4">
            {["package.json", "route.ts", "auth.ts"].map((tab, i) => (
              <div
                key={tab}
                className={`px-4 py-2 rounded-t-lg text-xs font-mono cursor-pointer ${
                  i === 0
                    ? "bg-gray-900 text-white border-b-2 border-purple-500"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {tab}
              </div>
            ))}
          </div>

          <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300">
            <div className="flex gap-4">
              <span className="text-gray-600 w-6 text-right">1</span>
              <span className="text-purple-300">import</span>
              <span className="text-gray-300">{` { Redis } `}</span>
              <span className="text-purple-300">from</span>
              <span className="text-green-300">&quot;ioredis&quot;</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 w-6 text-right">2</span>
              <span className="text-purple-300">import</span>
              <span className="text-gray-300">{` { sign, verify } `}</span>
              <span className="text-purple-300">from</span>
              <span className="text-green-300">&quot;jsonwebtoken&quot;</span>
            </div>
            <div className="flex gap-4"><span className="text-gray-600 w-6 text-right">3</span><span className="text-gray-400"></span></div>
            <div className="flex gap-4">
              <span className="text-gray-600 w-6 text-right">4</span>
              <span className="text-blue-300">const</span>
              <span className="text-gray-300">redis =</span>
              <span className="text-purple-300">new</span>
              <span className="text-yellow-300">Redis</span>
              <span className="text-gray-300">()</span>
            </div>
            <div className="flex gap-4"><span className="text-gray-600 w-6 text-right">5</span><span className="text-gray-400"></span></div>
            <div className="flex gap-4 bg-blue-900/30 rounded">
              <span className="text-gray-600 w-6 text-right">6</span>
              <span className="text-blue-300">export</span>
              <span className="text-blue-300">async</span>
              <span className="text-blue-300">function</span>
              <span className="text-yellow-300">login</span>
              <span className="text-gray-300">(email, password) {'{'}</span>
              <span className="text-blue-400 shrink-0">◀</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-gray-500">STEP 1: 빈칸 채우기</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-500">STEP 2: 오류 찾기</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-500">STEP 3: 코드 작성</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

