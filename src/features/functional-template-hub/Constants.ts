/**
 * FunctionalTemplates 페이지 상수
 * - 추천 기술 스택
 * - 로딩 메시지
 * - 템플릿 데이터
 */

export const RECOMMENDED_STACKS = [
  { label: 'Next.js + Prisma', value: 'Next.js + Prisma' },
  { label: 'Python + Flask', value: 'Python + Flask' },
  { label: 'FastAPI + React', value: 'FastAPI + React' },
  { label: 'Django + Vue.js', value: 'Django + Vue.js' },
  { label: 'Rust + WebAssembly', value: 'Rust + WebAssembly' },
  { label: 'Go + React', value: 'Go + React' },
];

export const LOADING_STEPS = [
  'AI가 아키텍처를 설계 중입니다...',
  '서버 환경 구축 중...',
  '프론트엔드 템플릿 생성 중...',
  '실습 환경 최적화 중...',
];

export const TEMPLATES = [
  {
    id: 'user-auth',
    title: '사용자 인증 시스템 심화',
    description: 'React + Spring Boot 기반의 회원 관리 및 CRUD 실습',
    icon: '🔐',
    status: 'ready',
    tags: ['React', 'Spring Boot', 'CRUD'],
    duration: '약 2시간',
  },
  {
    id: 'data-viz',
    title: '데이터 시각화',
    description: 'D3.js와 Chart.js를 활용한 데이터 시각화 실습',
    icon: '📊',
    status: 'coming-soon',
    tags: ['D3.js', 'Chart.js', 'React'],
    duration: '약 3시간',
  },
  {
    id: 'realtime-chat',
    title: '실시간 채팅 애플리케이션',
    description: 'WebSocket을 활용한 실시간 채팅 시스템 구축',
    icon: '💬',
    status: 'coming-soon',
    tags: ['WebSocket', 'Node.js', 'React'],
    duration: '약 4시간',
  },
];

export const STATS = [
  { number: '50+', label: '실습 템플릿' },
  { number: '100+', label: '기술 조합' },
  { number: 'AI 기반', label: '맞춤형 생성' },
];