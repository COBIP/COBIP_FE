"use client";

import { useState } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";

/* ------------------ 더미 데이터 ------------------ */
const purpleShades = [
  "#7F77DD",
  "#534AB7",
  "#AFA9EC",
  "#6B63CC",
  "#9B94E8",
  "#4A42A8",
  "#8880D8",
  "#5D56BC",
  "#B3ADEE",
  "#6058C4",
  "#A39DE6",
  "#726AC8",
];

const dummyTemplates = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `Template ${i + 1}`,
  category: ["React", "Vue.js", "Spring", "Java", "Kotlin", "Python", "Nest"][i % 7],
  rating: [4.7, 4.3, 4.6, 4.9, 4.5, 4.7, 4.3, 4.4, 4.8, 4.2][i % 10],
  color: purpleShades[i % purpleShades.length],
}));

const categories = [
  "React", "Vue.js", "Angular", "Spring", "Java", "Kotlin", "Python",
  "Nest", "Express", "Django", "Flask", "FastAPI",
];

const tags = ["Spring", "Java", "React", "Kotlin", "Vue.js", "Nest", "Python"];

/* ------------------ 카테고리 모달 ------------------ */
function CategoryModal({
  isOpen,
  onClose,
  selectedCategories,
  onSelectCategories,
}: {
  isOpen: boolean;
  onClose: () => void;
  selectedCategories: string[];
  onSelectCategories: (cats: string[]) => void;
}) {
  if (!isOpen) return null;

  const toggle = (c: string) => {
    onSelectCategories(
      selectedCategories.includes(c)
        ? selectedCategories.filter((v) => v !== c)
        : [...selectedCategories, c]
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">카테고리 선택</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 목록 */}
          <div className="px-6 py-4 space-y-1">
            {categories.map((c) => (
              <label
                key={c}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 cursor-pointer transition"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(c)}
                  onChange={() => toggle(c)}
                  className="w-4 h-4 accent-purple-600"
                />
                <span className="text-sm font-medium">{c}</span>
              </label>
            ))}
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition cursor-pointer"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------ 템플릿 카드 ------------------ */
function TemplateCard({ t }: { t: typeof dummyTemplates[number] }) {
  return (
    <div className="cursor-pointer group">
      {/* 썸네일 */}
      <div
        className="h-40 md:h-44 rounded-xl flex flex-col items-center justify-center
          relative overflow-hidden
          transition-all duration-200 ease-out
          group-hover:scale-[1.05] group-hover:-translate-y-1
          group-hover:shadow-[0_12px_28px_rgba(83,74,183,0.35)]"
        style={{ backgroundColor: t.color }}
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.07] transition-all duration-200" />
        <p className="text-xs text-white/70 mb-1">Template</p>
        <p className="text-2xl font-medium text-white">{t.id}</p>
      </div>

      {/* 카드 하단 정보 */}
      <div className="mt-2.5 px-0.5">
        <p className="text-sm font-medium text-gray-900 truncate mb-1.5">
          {t.title}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 rounded-full">
            {t.category}
          </span>
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <span className="text-amber-400">★</span>
            {t.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------ 슬라이더 카드 (인기/추천용) ------------------ */
function SlideCard({ t }: { t: typeof dummyTemplates[number] }) {
  return (
    <div className="cursor-pointer group flex-1">
      <div
        className="h-40 rounded-xl flex flex-col items-center justify-center
          relative overflow-hidden
          transition-all duration-200 ease-out
          group-hover:scale-[1.04] group-hover:-translate-y-1
          group-hover:shadow-[0_8px_20px_rgba(83,74,183,0.3)]"
        style={{ backgroundColor: t.color }}
      >
        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.07] transition-all duration-200" />
        <p className="text-xs text-white/70 mb-1">Template</p>
        <p className="text-xl font-medium text-white">{t.id}</p>
      </div>
      <div className="mt-2 px-0.5">
        <p className="text-sm font-medium text-gray-900 truncate mb-1">{t.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
            {t.category}
          </span>
          <span className="text-xs text-amber-600 flex items-center gap-1">
            <span className="text-amber-400">★</span>
            {t.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------ 메인 ------------------ */
export default function Home() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [popularIndex, setPopularIndex] = useState(0);
  const [recommendIndex, setRecommendIndex] = useState(0);

  const slideSize = 4;
  const itemsPerPage = 12;

  /* 필터 */
  const filtered =
    selectedTags.length > 0
      ? dummyTemplates.filter((t) => selectedTags.includes(t.category))
      : dummyTemplates;

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const pageData = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  /* 슬라이드 데이터 */
  const popularSlides = dummyTemplates.slice(popularIndex, popularIndex + slideSize);
  const recommendSlides = dummyTemplates.slice(recommendIndex, recommendIndex + slideSize);

  /* 슬라이드 이동 */
  const nextPopular = () =>
    setPopularIndex((p) => (p + slideSize < dummyTemplates.length ? p + slideSize : 0));
  const prevPopular = () =>
    setPopularIndex((p) => (p - slideSize >= 0 ? p - slideSize : dummyTemplates.length - slideSize));
  const nextRecommend = () =>
    setRecommendIndex((p) => (p + slideSize < dummyTemplates.length ? p + slideSize : 0));
  const prevRecommend = () =>
    setRecommendIndex((p) => (p - slideSize >= 0 ? p - slideSize : dummyTemplates.length - slideSize));

  return (
    <div className="min-h-screen bg-white">

      {/* ── 헤더 ── */}
      <header className="border-b shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-14">
            <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
              COBIZ
            </div>
            <nav className="hidden md:flex gap-6">
              {["문법 템플릿", "기능 템플릿", "자료구조", "코테집", "커뮤니티"].map((item) => (
                <a key={item} href="#" className="text-sm text-gray-600 hover:text-purple-700 transition">
                  {item}
                </a>
              ))}
            </nav>
            <div className="flex gap-2">
              <button className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition cursor-pointer">
                로그인
              </button>
              <button className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition cursor-pointer">
                회원가입
              </button>
            </div>
          </div>

        <div className="pb-3 flex justify-center">
            <div className="relative w-1/2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                    className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-300 transition"
                    placeholder="템플릿 검색..."
                />
            </div>
        </div>
    </div>
    </header>

      {/* ── 히어로 ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-12 bg-gradient-to-br from-purple-50 to-indigo-100 items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#26215C] leading-snug mb-3">
            개발자를 위한<br />템플릿 마켓
          </h1>
          <p className="text-sm text-purple-700 leading-relaxed mb-6">
            다양한 프로젝트 템플릿을 검색하고, 필터링하여<br />당신의 개발을 빠르게 시작하세요.
          </p>
          <button className="bg-purple-600 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-purple-700 transition cursor-pointer">
            템플릿 둘러보기
          </button>
        </div>
        <div className="bg-purple-200 rounded-xl min-h-[220px] flex flex-col items-center justify-center gap-3">
          <div className="flex gap-1 items-end">
            <div className="w-7 h-9 rounded bg-green-300" style={{ transform: "rotate(-8deg)" }} />
            <div className="w-7 h-9 rounded bg-blue-300" style={{ transform: "rotate(-2deg)" }} />
            <div className="w-7 h-9 rounded bg-orange-300" style={{ transform: "rotate(4deg)" }} />
          </div>
          <span className="text-sm text-purple-600">템플릿 이미지</span>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-10">

        {/* ── 인기 슬라이더 ── */}
        <h2 className="font-bold mb-4 text-gray-800">🔥 인기</h2>
        <div className="relative mb-12 px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularSlides.map((t) => (
              <SlideCard key={t.id} t={t} />
            ))}
          </div>
          <button
            onClick={prevPopular}
            className="absolute left-0 top-1/3 -translate-y-1/2 bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow hover:shadow-md hover:bg-purple-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextPopular}
            className="absolute right-0 top-1/3 -translate-y-1/2 bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow hover:shadow-md hover:bg-purple-50 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── 추천 슬라이더 ── */}
        <h2 className="font-bold mb-4 text-gray-800">⭐ 추천</h2>
        <div className="relative mb-12 px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendSlides.map((t) => (
              <SlideCard key={t.id} t={t} />
            ))}
          </div>
          <button
            onClick={prevRecommend}
            className="absolute left-0 top-1/3 -translate-y-1/2 bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow hover:shadow-md hover:bg-purple-50 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextRecommend}
            className="absolute right-0 top-1/3 -translate-y-1/2 bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow hover:shadow-md hover:bg-purple-50 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ── 카테고리 버튼 ── */}
        <button
          onClick={() => setShowModal(true)}
          className="border px-4 py-2 mb-4 rounded-lg text-sm hover:bg-purple-50 hover:border-purple-400 hover:text-purple-700 transition cursor-pointer"
        >
          카테고리
        </button>

        {/* ── 태그 필터 ── */}
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTags((prev) =>
                  prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                );
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-xs border transition cursor-pointer
                ${selectedTags.includes(tag)
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-white text-gray-600 border-gray-300 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                }`}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* ── 템플릿 그리드 ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {pageData.map((t) => (
            <TemplateCard key={t.id} t={t} />
          ))}
        </div>

        {/* ── 페이지네이션 ── */}
        <div className="flex justify-center items-center gap-1.5 mt-10">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-4 h-9 rounded-full border text-sm hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
          >
            이전
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`w-9 h-9 rounded-full text-sm font-medium transition cursor-pointer
                ${page === n
                  ? "bg-purple-600 text-white"
                  : "border hover:bg-purple-50 hover:text-purple-700"
                }`}
            >
              {n}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-4 h-9 rounded-full border text-sm hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
          >
            다음
          </button>
        </div>
      </main>

      {/* ── 카테고리 모달 ── */}
      <CategoryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        selectedCategories={selectedCategories}
        onSelectCategories={setSelectedCategories}
      />
    </div>
  );
}