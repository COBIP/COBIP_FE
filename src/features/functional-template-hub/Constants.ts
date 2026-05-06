/**
 * FunctionalTemplates 페이지 상수
 * - 추천 요구사항 (AI 섹션용)
 * - 로딩 메시지
 * - 템플릿 데이터
 */

export const RECOMMENDED_FEATURES = [
  { label: 'JWT 소셜 로그인', value: 'OAuth 2.0 기반 구글 로그인 및 회원가입 로직' },
  { label: '실시간 재고 장바구니', value: 'Redis를 활용한 동시성 제어 장바구니 시스템' },
  { label: '대용량 이미지 처리', value: 'S3 업로드 및 클라우드프론트 이미지 최적화' },
  { label: '실시간 알림 피드', value: 'WebSocket을 이용한 실시간 푸시 알림 서비스' },
  { label: '결제 시스템 연동', value: '포트원 API를 활용한 결제 승인 및 취소 로직' },
  { label: '계층형 댓글 시스템', value: '무한 대댓글 및 좋아요 기능 아키텍처' },
];

export const LOADING_STEPS = [
  '사용자 요구사항을 분석 중입니다...',
  '비즈니스 로직 아키텍처 설계 중...',
  '기능별 프론트/백엔드 보일러플레이트 생성 중...',
  '맞춤형 실습 환경 최적화 중...',
];

export const TEMPLATES = [
  {
    id: 'user-auth',
    title: '사용자 인증 시스템',
    description: '단순 로그인을 넘어 JWT 만료 처리와 리프레시 토큰, 권한 기반 라우팅을 학습합니다.',
    icon: '🔐',
    status: 'ready',
    tags: ['인증', '보안', 'JWT'],
    duration: '약 2시간',
  },
  {
    id: 'data-viz',
    title: '실시간 데이터 대시보드',
    description: '스트리밍 데이터를 D3.js로 시각화하고 대용량 차트 렌더링 성능을 최적화합니다.',
    icon: '📊',
    status: 'coming-soon',
    tags: ['데이터 시각화', '성능최적화'],
    duration: '약 3시간',
  },
  {
    id: 'realtime-chat',
    title: '실시간 협업 에디터',
    description: 'WebSocket과 CRDT 알고리즘을 활용해 여러 사용자가 동시 편집하는 환경을 구축합니다.',
    icon: '💬',
    status: 'coming-soon',
    tags: ['웹소켓', '동시성제어'],
    duration: '약 4시간',
  },
];

export const STATS = [
  { number: '10+', label: '실무 핵심 기능' },
  { number: 'Infinite', label: 'AI 커스텀 설계' },
  { number: '1:1', label: '코드 리뷰 환경' },
];