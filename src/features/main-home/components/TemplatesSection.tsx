import { Code, Layers, Sparkles, Lightbulb } from "lucide-react";

export function TemplatesSection() {
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
          <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer">
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
              {["React", "Vue.js", "Spring", "Python", "Java", "Nest"].map((lang) => (
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

          <GrammarPreviewMockup />
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

/* 문법 템플릿 미리보기 목업 */
function GrammarPreviewMockup() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* 탭 바 */}
      <div className="flex border-b border-gray-100">
        <div className="px-6 py-3 text-sm font-medium text-purple-700 border-b-2 border-purple-600">변수 선언</div>
        <div className="px-6 py-3 text-sm font-medium text-gray-400">조건문</div>
        <div className="px-6 py-3 text-sm font-medium text-gray-400">반복문</div>
        <div className="px-6 py-3 text-sm font-medium text-gray-400">함수</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* 왼쪽: 코드 에디터 목업 */}
        <div className="bg-gray-900 p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-500 font-mono">script.py</span>
          </div>
          <div className="font-mono text-sm leading-relaxed space-y-1">
            <div className="flex gap-4">
              <span className="text-gray-600 w-8 text-right shrink-0">1</span>
              <span className="text-blue-300">name</span>
              <span className="text-gray-300">=</span>
              <span className="text-green-300">&quot;COBIP&quot;</span>
            </div>
            <div className="flex gap-4 bg-blue-900/30 rounded">
              <span className="text-gray-600 w-8 text-right shrink-0">2</span>
              <span className="text-blue-300">count</span>
              <span className="text-gray-300">=</span>
              <span className="text-yellow-300">3</span>
              <span className="text-blue-400 shrink-0">◀</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 w-8 text-right shrink-0">3</span>
              <span className="text-blue-300">is_active</span>
              <span className="text-gray-300">=</span>
              <span className="text-yellow-300">True</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-600 w-8 text-right shrink-0">4</span>
              <span className="text-gray-300">print(name, count, is_active)</span>
            </div>
          </div>
        </div>

        {/* 오른쪽: 시각화 패널 목업 */}
        <div className="bg-white p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">현재 단계:</span> count 변수에 숫자 3을 할당한다
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">변수 상태</h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'name', value: 'COBIP', type: 'string' },
                { name: 'count', value: '3', type: 'number' },
                { name: 'is_active', value: 'True', type: 'bool' },
              ].map((v) => (
                <div key={v.name} className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{v.name}</p>
                  <p className="text-xl font-bold text-blue-600">{v.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{v.type}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-700 mb-2">출력 결과</h4>
            <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">COBIP 3 True</div>
          </div>
        </div>
      </div>
    </div>
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
