/**
 * GrammarTemplate 페이지 상수
 * - 템플릿 데이터
 * - 토픽 시나리오 데이터
 */

export interface TopicScenario {
  title: string;
  subtitle: string;
  code: string;
  currentLine: number;
  stepDescription: string;
  variables: Array<{ name: string; value: string | number; type: string }>;
  arrayValues: Array<{ index: number; value: string | number }>;
  currentIndex: number;
  outputLines: string[];
  currentStep: number;
  totalSteps: number;
}

export const TOPIC_SCENARIOS: Record<string, TopicScenario> = {
  variables: {
    title: '변수 선언',
    subtitle: 'Python으로 변수 선언과 값 할당을 익혀요',
    code: `name = "COBIP"
count = 3
is_active = True
print(name, count, is_active)`,
    currentLine: 2,
    stepDescription: 'count 변수에 숫자 3을 할당한다',
    variables: [
      { name: 'name', value: 'COBIP', type: 'string' },
      { name: 'count', value: 3, type: 'number' },
      { name: 'is_active', value: 'True', type: 'bool' },
    ],
    arrayValues: [
      { index: 0, value: 'name' },
      { index: 1, value: 'count' },
      { index: 2, value: 'is_active' },
      { index: 3, value: '-' },
    ],
    currentIndex: 1,
    outputLines: ['COBIP 3 True'],
    currentStep: 2,
    totalSteps: 4,
  },
  conditions: {
    title: '조건문',
    subtitle: 'if/else 분기 흐름을 따라가요',
    code: `score = 72

if score >= 80:
    result = "합격"
else:
    result = "불합격"

print(result)`,
    currentLine: 6,
    stepDescription: '조건이 거짓이므로 else 블록이 실행된다',
    variables: [
      { name: 'score', value: 72, type: 'number' },
      { name: 'result', value: '불합격', type: 'string' },
    ],
    arrayValues: [
      { index: 0, value: 'score>=80' },
      { index: 1, value: 'False' },
      { index: 2, value: 'else' },
      { index: 3, value: 'run' },
    ],
    currentIndex: 1,
    outputLines: ['불합격'],
    currentStep: 3,
    totalSteps: 4,
  },
  loops: {
    title: '반복문',
    subtitle: 'for 루프에서 누적값이 변하는 과정을 확인해요',
    code: `values = [3, 7, 2, 5]
total = 0

for value in values:
    total += value
    print(f"Current: {value}, Total: {total}")`,
    currentLine: 5,
    stepDescription: '두 번째 원소 7을 더해 total이 10이 된다',
    variables: [
      { name: 'value', value: 7, type: 'number' },
      { name: 'total', value: 10, type: 'number' },
    ],
    arrayValues: [
      { index: 0, value: 3 },
      { index: 1, value: 7 },
      { index: 2, value: 2 },
      { index: 3, value: 5 },
    ],
    currentIndex: 1,
    outputLines: ['Current: 3, Total: 3', 'Current: 7, Total: 10'],
    currentStep: 2,
    totalSteps: 4,
  },
  functions: {
    title: '함수',
    subtitle: '함수 정의와 호출 결과를 확인해요',
    code: `def add(a, b):
    return a + b

result = add(4, 6)
print(result)`,
    currentLine: 4,
    stepDescription: 'add(4, 6)을 호출해 result에 10을 저장한다',
    variables: [
      { name: 'a', value: 4, type: 'number' },
      { name: 'b', value: 6, type: 'number' },
      { name: 'result', value: 10, type: 'number' },
    ],
    arrayValues: [
      { index: 0, value: 'a=4' },
      { index: 1, value: 'b=6' },
      { index: 2, value: 'return' },
      { index: 3, value: 10 },
    ],
    currentIndex: 3,
    outputLines: ['10'],
    currentStep: 4,
    totalSteps: 4,
  },
};

/* ================== 템플릿 목록 데이터 ================== */
export interface GrammarTemplateData {
  id: string;
  title: string;
  description: string;
  icon: string;
  status: 'ready' | 'coming-soon';
  topics: string[];
  tags: string[];
  badge: '인기' | '추천' | '신규' | null;
  rating: number;
  duration: string;
  color: string;
}

export const GRAMMAR_TEMPLATES: GrammarTemplateData[] = [
  {
    id: 'python',
    title: 'Python 문법',
    description: '변수 선언부터 함수까지 Python 기초 문법을 단계별로 학습합니다.',
    icon: '🐍',
    status: 'ready',
    topics: ['변수 선언', '조건문', '반복문', '함수'],
    tags: ['초급', '기초 문법'],
    badge: '인기',
    rating: 4.8,
    duration: '약 2시간',
    color: 'from-blue-100 to-green-100',
  },
  {
    id: 'java',
    title: 'Java 문법',
    description: '객체지향 프로그래밍의 기초부터 컬렉션, 스트림까지 학습합니다.',
    icon: '☕',
    status: 'ready',
    topics: ['클래스/객체', '상속/인터페이스', '컬렉션', '스트림'],
    tags: ['초급', '중급'],
    badge: '추천',
    rating: 4.6,
    duration: '약 4시간',
    color: 'from-red-100 to-orange-100',
  },
  {
    id: 'javascript',
    title: 'JavaScript 문법',
    description: '비동기 처리와 최신 ES6+ 문법까지 JavaScript의 핵심을 배웁니다.',
    icon: '🟨',
    status: 'ready',
    topics: ['변수/상수', '함수', '배열/객체', '비동기'],
    tags: ['초급', '중급'],
    badge: '신규',
    rating: 4.7,
    duration: '약 3시간',
    color: 'from-yellow-100 to-amber-100',
  },
  {
    id: 'react',
    title: 'React 문법',
    description: '컴포넌트, 훅, 상태 관리까지 React 개발의 핵심을 배웁니다.',
    icon: '⚛️',
    status: 'ready',
    topics: ['JSX', '컴포넌트', 'Hooks', '상태 관리'],
    tags: ['중급', '프레임워크'],
    badge: '신규',
    rating: 4.9,
    duration: '약 5시간',
    color: 'from-cyan-100 to-blue-100',
  },
  {
    id: 'go',
    title: 'Go 문법',
    description: 'Go 언어의 간결한 문법과 고루틴을 활용한 동시성 프로그래밍을 배웁니다.',
    icon: '🔵',
    status: 'coming-soon',
    topics: ['기본 문법', '구조체', '인터페이스', '고루틴'],
    tags: ['중급', '고급'],
    badge: null,
    rating: 0,
    duration: '약 3시간',
    color: 'from-sky-100 to-cyan-100',
  },
];

/* ================== 파이썬 강의 콘텐츠 (페이지형) ================== */
export interface LessonContent {
  id: string;
  title: string;
  contentParagraphs: string[];
  highlights?: { title: string; lines: string[]; bgColor?: string; borderColor?: string; textColor?: string }[];
  code?: string;
  codeLanguage?: string;
}

export const PYTHON_LESSONS: LessonContent[] = [
  {
    id: 'intro',
    title: '0. 파이썬 프로그래밍 소개',
    contentParagraphs: [
      '파이썬은 **가독성**이 뛰어나고 배우기 쉬운 프로그래밍 언어입니다. 웹 개발, 데이터 분석, 인공지능 등 다양한 분야에서 사용되고 있어요.',
      '이번 코스에서는 파이썬의 기초 문법을 하나씩 배워볼 거예요. 변수, 조건문, 반복문, 함수까지 함께 따라와 주세요!',
    ],
    highlights: [
      {
        title: '💡 파이썬의 특징',
        lines: [
          '• 쉬운 문법으로 초보자도 빠르게 배울 수 있어요',
          '• 다양한 라이브러리로 확장성이 무궁무진해요',
          '• 커뮤니티가 활성화되어 있어 자료가 풍부해요',
        ],
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
      },
    ],
  },
  {
    id: 'variables',
    title: '1. 변수',
    contentParagraphs: [
      '**변수**는 데이터를 저장하는 공간입니다. 파이썬에서는 `변수명 = 값` 형태로 사용해요.',
      '변수 이름은 의미 있게 짓는 것이 좋아요. 예를 들어 사용자의 이름을 저장한다면 `user_name`처럼요!',
    ],
    highlights: [
      {
        title: '📌 핵심 포인트',
        lines: [
          '파이썬은 타입을 명시적으로 선언할 필요가 없어요.',
          '값을 할당하면 자동으로 타입이 결정됩니다!',
        ],
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
      },
    ],
    code: `# 문자열 변수
name = "COBIP"

# 숫자 변수
count = 3
pi = 3.14

# 불리언 변수
is_active = True

# 여러 변수 한 번에 출력
print(name, count, pi, is_active)`,
    codeLanguage: 'python',
  },
  {
    id: 'data-types',
    title: '2. 자료형',
    contentParagraphs: [
      '파이썬의 주요 **자료형**을 알아봅시다. 자료형에 따라 할 수 있는 연산이 달라져요.',
    ],
    highlights: [
      {
        title: '📦 주요 자료형',
        lines: [
          'int (정수형): 3, -5, 100',
          'float (실수형): 3.14, -0.5',
          'str (문자열): "Hello", "COBIP"',
          'bool (불리언): True, False',
          'list (리스트): [1, 2, 3]',
          'dict (딕셔너리): {"key": "value"}',
        ],
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
      },
    ],
    code: `# 자료형 확인하기
name = "COBIP"
age = 25
height = 175.5
is_student = True

print(type(name))       # <class 'str'>
print(type(age))        # <class 'int'>
print(type(height))     # <class 'float'>
print(type(is_student)) # <class 'bool'>`,
    codeLanguage: 'python',
  },
];
