export type ProblemStatus = 'completed' | 'in-progress' | 'not-started';

export interface BaseProblem {
    id: number;
    title: string;
    description: string;
    solveCount: number;
    language: string;
    testType: string;
    difficulty: string;
    type: string;
}

// 2. 현재 로그인한 특정 유저의 풀이 상태 데이터
export interface UserProgress {
    userId: number;    // 유저를 식별하기 위한 번호 추가
    problemId: number; // 어떤 문제에 대한 기록인지 연결할 ID
    status: ProblemStatus;
}

// 3. 프론트엔드 UI 컴포넌트에서 실제로 사용하는 병합된 데이터
export interface Problem extends BaseProblem {
    status: ProblemStatus;
}