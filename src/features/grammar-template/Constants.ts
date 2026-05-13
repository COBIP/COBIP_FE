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
  chapters: GrammarTemplateChapter[];
}

/** 문법 템플릿 챕터 (목차) */
export interface GrammarTemplateChapter {
  id: number;
  templateId: number;
  title: string;
  orderIndex: number;
  contentJson: Record<string, unknown>;
  practiceFiles: unknown[];
  createdAt: string;
  updatedAt: string;
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

/* ================== 코드 실행/실행흐름 타입 ================== */

/** 코드 실행 요청 */
export interface CodeRunRequest {
  sourceCode: string;
  language?: string;
  input?: string;
}

/** 실행흐름 요청 */
export interface ExecutionFlowRequest {
  sourceCode: string;
  language: string;
}

/** 실행흐름 스텝 */
export interface ExecutionFlowStep {
  stepOrder: number;
  lineNumber: number;
  sourceLine: string;
  eventType: 'OUTPUT' | 'CONDITION' | 'LOOP' | 'FUNCTION' | 'ASSIGNMENT' | 'LINE';
  description: string;
}

/** 실행흐름 응답 */
export interface ExecutionFlowResponse {
  templateId: number;
  chapterId: number;
  language: string;
  traceMode: string;
  message: string;
  steps: ExecutionFlowStep[];
}

/** 코드 실행 응답 */
export interface CodeRunResponse {
  status: 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'INTERNAL_ERROR';
  stdout: string | null;
  stderr: string | null;
  compileOutput: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
}

