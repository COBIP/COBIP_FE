"use client";

import {
  Search,
  Sparkles,
  Share2,
  BookOpen,
  Code,
  Layers,
  ArrowRight,
  CheckCircle,
  Lightbulb,
} from "lucide-react";
import Link from "next/link";

/* ------------------ 메인 페이지 ------------------ */
export default function Home() {

  return (
    <div className="min-h-screen bg-white">
      {/* ────────────────────────────────────────────── */}
      {/* 헤더 */}
      {/* ────────────────────────────────────────────── */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            {/* 로고 */}
            <Link href="/main-home" className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition">
                <div className="w-8 h-8 bg-[#D7C9FB] rounded-lg flex items-center justify-center text-slate-900 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                        <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
                    </svg>
                </div>
                <span className="text-slate-900 text-xl font-bold tracking-tight">COBIP</span>
            </Link>

                        {/* 네비게이션 */}
            <nav className="hidden md:flex gap-6">
              <Link href="/grammar-template" className="text-sm text-gray-600 hover:text-purple-700 transition">
                문법 템플릿
              </Link>
              <Link href="/functional-template" className="text-sm text-gray-600 hover:text-purple-700 transition">
                기능 템플릿
              </Link>
              <a href="#" className="text-sm text-gray-600 hover:text-purple-700 transition">
                커뮤니티
              </a>
            </nav>

            {/* 로그인/회원가입 버튼 */}
            <div className="flex gap-2">
              <Link 
                href="/login" 
                className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition cursor-pointer flex items-center justify-center"
              >
                로그인
              </Link>
              <Link 
                href="/signup" 
                className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition cursor-pointer flex items-center justify-center"
              >
                회원가입
              </Link>
            </div>
          </div>
            </div>
      </header>

      {/* ────────────────────────────────────────────── */}
      {/* 히어로 섹션 - 서비스 소개 */}
      {/* ────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="flex flex-col md:flex-row items-center gap-12">
            {/* 왼쪽: 텍스트 */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                AI 기반 템플릿 생성
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                직접 만드는
                <br />
                <span className="text-purple-600">맞춤형 학습</span> 템플릿
          </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-lg mx-auto md:mx-0">
                React, Vue, Spring 등 실무 기술을 템플릿을 통해 학습하세요.
                <br />
                원하는 내용이 없다면 AI가 직접 만들어 드립니다.
          </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                                <Link
                  href="/grammar-template"
                  className="bg-purple-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-purple-700 transition cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  템플릿 둘러보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="#how-it-works"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition cursor-pointer inline-flex items-center justify-center gap-2"
          >
                  사용 방법 보기
                </Link>
        </div>
          </div>

            {/* 오른쪽: 일러스트 */}
            <div className="flex-1">
              <div className="bg-gradient-to-br from-purple-200 to-indigo-200 rounded-2xl p-8 md:p-10 max-w-md mx-auto">
                <div className="space-y-3">
                  {/* 더미 코드 블록 */}
                  <div className="bg-white/80 backdrop-blur rounded-lg p-4 shadow-sm">
                    <div className="flex gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-red-400" />
                      <div className="w-2 h-2 rounded-full bg-yellow-400" />
                      <div className="w-2 h-2 rounded-full bg-green-400" />
        </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 bg-purple-200 rounded" />
                      <div className="h-2 w-32 bg-purple-300 rounded" />
                      <div className="h-2 w-20 bg-purple-200 rounded" />
                      <div className="h-2 w-40 bg-purple-300 rounded" />
        </div>
        </div>
                  {/* 더미 템플릿 카드 */}
                  <div className="flex gap-2">
                    <div className="bg-white/80 backdrop-blur rounded-lg p-3 flex-1 shadow-sm">
                      <div className="h-2 w-16 bg-purple-300 rounded mb-2" />
                      <div className="h-2 w-12 bg-gray-200 rounded" />
        </div>
                    <div className="bg-white/80 backdrop-blur rounded-lg p-3 flex-1 shadow-sm">
                      <div className="h-2 w-16 bg-indigo-300 rounded mb-2" />
                      <div className="h-2 w-12 bg-gray-200 rounded" />
    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────── */}
      {/* 사용 방법 섹션 (토스 스타일) */}
      {/* ────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
              이렇게 사용해보세요
            </h2>
            <p className="text-gray-500 text-lg">단 3단계로 나만의 학습을 시작할 수 있어요</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Search className="w-7 h-7 text-purple-600" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mb-3">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">템플릿 선택</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                문법 템플릿이나 기능 템플릿 중<br />
                원하는 학습 주제를 선택하세요
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-7 h-7 text-indigo-600" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mb-3">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI 생성 또는 직접 선택</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                원하는 템플릿이 없다면 AI에게<br />
                직접 요청해서 만들 수 있어요
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-7 h-7 text-amber-600" />
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold mb-3">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">학습 & 미션 풀이</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                설계 의도부터 소스 코드, 미션까지<br />
                단계별로 학습해보세요
              </p>
            </div>
          </div>
        </div>
      </section>

            {/* ────────────────────────────────────────────── */}
      {/* 템플릿 종류 소개 */}
      {/* ────────────────────────────────────────────── */}
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

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* 탭 바 */}
              <div className="flex border-b border-gray-100">
                <div className="px-6 py-3 text-sm font-medium text-purple-700 border-b-2 border-purple-600">
                  변수 선언
                </div>
                <div className="px-6 py-3 text-sm font-medium text-gray-400">
                  조건문
                </div>
                <div className="px-6 py-3 text-sm font-medium text-gray-400">
                  반복문
                </div>
                <div className="px-6 py-3 text-sm font-medium text-gray-400">
                  함수
                </div>
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
                  {/* 현재 단계 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">현재 단계:</span> count 변수에 숫자 3을 할당한다
                    </p>
                  </div>

                  {/* 변수 상태 */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">변수 상태</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">name</p>
                        <p className="text-xl font-bold text-blue-600">COBIP</p>
                        <p className="text-xs text-gray-400 mt-1">string</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg border border-blue-200 p-4 text-center ring-2 ring-blue-400">
                        <p className="text-xs text-gray-500 mb-1">count</p>
                        <p className="text-xl font-bold text-blue-600">3</p>
                        <p className="text-xs text-gray-400 mt-1">number</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">is_active</p>
                        <p className="text-xl font-bold text-blue-600">True</p>
                        <p className="text-xs text-gray-400 mt-1">bool</p>
                      </div>
                    </div>
                  </div>

                  {/* 출력 결과 */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">출력 결과</h4>
                    <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm text-green-400">
                      COBIP 3 True
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 실제 화면 미리보기: 기능 템플릿 ── */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">🛠️ 기능 템플릿 살펴보기</h3>
              <p className="text-gray-500">설계 의도부터 소스 코드, 미션까지 단계별로 학습해요</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* 사이드바 + 컨텐츠 영역 */}
              <div className="flex flex-col lg:flex-row">
                {/* 왼쪽 사이드바 목업 */}
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

                {/* 오른쪽 컨텐츠 영역 */}
                <div className="flex-1 p-6">
                  {/* 헤더 */}
                  <div className="flex items-center gap-2 mb-6">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    <h4 className="text-lg font-bold text-gray-900">설계 의도</h4>
                  </div>

                  {/* 내용 */}
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-5 mb-6">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      이 템플릿은 <strong className="text-gray-900">사용자 인증 시스템</strong>의 기본 구조를 보여줍니다.
                      <br />
                      JWT(Json Web Token)와 Redis를 활용하여 access token과 refresh token을
                      <br />
                      안전하게 관리하는 로그인 기능을 구현합니다.
                    </p>
                  </div>

                  {/* 탭 목업 */}
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

                  {/* 코드 목업 */}
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
                    <div className="flex gap-4">
                      <span className="text-gray-600 w-6 text-right">3</span>
                      <span className="text-gray-400"></span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-gray-600 w-6 text-right">4</span>
                      <span className="text-blue-300">const</span>
                      <span className="text-gray-300">redis =</span>
                      <span className="text-purple-300">new</span>
                      <span className="text-yellow-300">Redis</span>
                      <span className="text-gray-300">()</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-gray-600 w-6 text-right">5</span>
                      <span className="text-gray-400"></span>
                    </div>
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

                  {/* 미션 목업 */}
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

      {/* ────────────────────────────────────────────── */}
      {/* 템플릿 공유 시스템 설명 */}
      {/* ────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <Share2 className="w-3.5 h-3.5" />
                템플릿 공유
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                만든 템플릿을 공유하고
                <br />
                <span className="text-purple-600">다른 사람들과 함께</span> 성장하세요
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                내가 만든 템플릿을 공유하면 다른 사람들도 사용할 수 있어요.
                <br />
                공유된 템플릿은 메인 페이지의 템플릿 목록에 추가되어
                <br />
                모두가 함께 배우고 성장하는 생태계를 만들어가요.
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">공개 / 비공개 설정 가능</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">템플릿 맞춤 수정</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-gradient-to-br from-gray-50 to-purple-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-200 rounded-full flex items-center justify-center text-purple-700 font-bold">
                    S
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">서현준</p>
                    <p className="text-xs text-gray-500">JWT 로그인 템플릿 제작자</p>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Share2 className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium">템플릿을 공유했습니다</span>
                  </div>
                  <p className="text-sm text-gray-500">
                    &ldquo;React + Spring Security를 활용한 JWT 로그인 기능 템플릿입니다.
                    <br />
                    Redis를 같이 곁들여서 refresh token 관리까지 해봤어요!&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

            {/* ── 템플릿 종류별 바로가기 ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">바로 학습하러 가기</h2>
          <p className="text-gray-500 mb-10">원하는 템플릿 유형을 선택하세요</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/grammar-template"
              className="inline-flex items-center gap-3 bg-purple-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-purple-700 transition cursor-pointer"
            >
              <BookOpen className="w-5 h-5" />
              문법 템플릿 바로가기
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/functional-template"
              className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-indigo-700 transition cursor-pointer"
            >
              <Layers className="w-5 h-5" />
              기능 템플릿 바로가기
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────── */}
      {/* 푸터 */}
      {/* ────────────────────────────────────────────── */}
      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#D7C9FB] rounded flex items-center justify-center text-slate-900">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <rect fill="currentColor" height="16" rx="3" width="16" x="4" y="4"></rect>
                  <circle cx="12" cy="12" fill="#f6f6f8" r="3"></circle>
                </svg>
              </div>
              <span className="text-sm font-bold text-gray-900">COBIP</span>
            </div>
            <p className="text-xs text-gray-400">
              © 2026 COBIP. 함께 성장하는 개발자 학습 플랫폼
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
