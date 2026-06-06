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
  practiceFiles: GrammarTemplatePracticeFile[];
  missions?: GrammarTemplateChapterMission[];
  createdAt: string;
  updatedAt: string;
}

export type GrammarTemplateMissionType = 'PROBLEM' | 'MISSION';

export interface GrammarTemplateChapterMission {
  id: number;
  templateId: number;
  chapterId: number;
  title: string;
  description?: string | null;
  missionType: GrammarTemplateMissionType;
  orderIndex: number;
  guideContent?: string | null;
  validationJson?: Record<string, unknown> | null;
}

/** 문법 템플릿 실습 파일 */
export interface GrammarTemplatePracticeFile {
  id: number;
  templateId: number;
  chapterId: number;
  nodeType: 'FILE' | 'FOLDER';
  filePath: string;
  language?: string;
  content?: string;
  readOnly: boolean;
  orderIndex: number;
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

export interface ExecutionFlowVariableSnapshot {
  name: string;
  value: string;
  expression: string;
  dataType?: string | null;
  changeType: 'CREATED' | 'UPDATED' | string;
  lineNumber: number;
  stepOrder: number;
  elements?: string[];
  activeIndex?: number | null;
}

export interface ExecutionFlowOutputSnapshot {
  value: string;
  expression: string;
  lineNumber: number;
  stepOrder: number;
}

/** 실행흐름 스텝 */
export interface ExecutionFlowStep {
  stepOrder: number;
  lineNumber: number;
  sourceLine: string;
  eventType: 'OUTPUT' | 'CONDITION' | 'LOOP' | 'FUNCTION' | 'ASSIGNMENT' | 'LINE';
  description: string;
  activeVariable?: ExecutionFlowVariableSnapshot | null;
  activeOutput?: ExecutionFlowOutputSnapshot | null;
  variables?: ExecutionFlowVariableSnapshot[];
  outputs?: ExecutionFlowOutputSnapshot[];
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
  status?: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'INTERNAL_ERROR';
  stdout?: string | null;
  stderr?: string | null;
  compileOutput?: string | null;
  message?: string | null;
  time?: string | null;
  memory?: number | null;
  output?: string;
}

/* ================== 마이페이지 대시보드 타입 ================== */
/** 마이페이지 문법 템플릿 카드 데이터 */
export interface GrammarTemplateData {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  status: 'ready' | 'preparing';
  badge?: string;
  topics: string[];
}

/** 인기 문법 템플릿 더미 데이터 */
export const GRAMMAR_TEMPLATES: GrammarTemplateData[] = [
  {
    id: '1',
    title: 'Python 기초 문법',
    description: '변수, 자료형, 조건문, 반복문 등 Python의 핵심 문법을 배워요.',
    icon: '🐍',
    color: 'from-blue-400 to-blue-500',
    status: 'ready',
    badge: '인기',
    topics: ['변수', '조건문', '반복문'],
  },
  {
    id: '2',
    title: 'JavaScript 기초 문법',
    description: '변수 선언, 함수, DOM 조작 등 JavaScript의 기본을 익혀요.',
    icon: '📜',
    color: 'from-yellow-400 to-yellow-500',
    status: 'ready',
    badge: '인기',
    topics: ['변수', '함수', 'DOM'],
  },
  {
    id: '3',
    title: 'Java 기초 문법',
    description: '클래스, 상속, 인터페이스 등 Java 객체지향 프로그래밍을 배워요.',
    icon: '☕',
    color: 'from-orange-400 to-orange-500',
    status: 'preparing',
    topics: ['클래스', '상속', '인터페이스'],
  },
  {
    id: '4',
    title: 'Python 고급 문법',
    description: '데코레이터, 제너레이터, async 등 Python 고급 기능을 알아봐요.',
    icon: '⚡',
    color: 'from-purple-400 to-purple-500',
    status: 'preparing',
    topics: ['데코레이터', '제너레이터', '비동기'],
  },
];

