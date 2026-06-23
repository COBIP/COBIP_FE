/**
 * FunctionalTemplates 페이지 상수
 * - 추천 주제
 * - 로딩 메시지
 * - 통계
 *
 * 템플릿 데이터는 API에서 동적으로 로드합니다.
 */

export const RECOMMENDED_FEATURES = [
  { label: '로그인', value: '로그인' },
  { label: '게시판', value: '게시판' },
  { label: '가위바위보', value: '가위바위보' },
];

export const LOADING_STEPS = [
  '사용자 요구사항을 분석 중입니다...',
  '비즈니스 로직 구조를 설계 중...',
  '기능별 프론트와 백엔드 흐름을 생성 중...',
  '맞춤형 실습 환경을 정리 중...',
];

export const STATS = [
  { number: '10+', label: '실무 핵심 기능' },
  { number: 'Infinite', label: 'AI 커스텀 설계' },
  { number: '1:1', label: '코드 리뷰 환경' },
];
