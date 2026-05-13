/**
 * GrammarTemplate 페이지 상수
 * - API 응답 타입 정의
 */

/* ================== API 응답 타입 ================== */

/** 문법 템플릿 목록 아이템 (API 응답) */
export interface GrammarTemplateItem {
  id: number;
  slug: string;
  title: string;
  language: 'JAVA' | 'PYTHON' | 'JAVASCRIPT';
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  summary: string;
}

/** 문법 템플릿 상세 (API 응답) */
export interface GrammarTemplateDetail {
  id: number;
  slug: string;
  title: string;
  language: 'JAVA' | 'PYTHON' | 'JAVASCRIPT';
  category: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  summary: string;
  contentJson: Record<string, unknown>;
}

/* ================== 레슨 콘텐츠 타입 ================== */

export interface LessonContent {
  id: string;
  title: string;
  contentParagraphs: string[];
  highlights?: { title: string; lines: string[]; bgColor?: string; borderColor?: string; textColor?: string }[];
  code?: string;
  codeLanguage?: string;
}

