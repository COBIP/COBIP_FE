import { BaseProblem, UserProgress, Problem } from '@/types/CodingTestTypes';

export const useCodingTest = () => {
    // 1. API로 받아온 순수 문제 목록이라고 가정
    const dummyBaseProblems: BaseProblem[] = [
        { id: 1, title: '가장 긴 팰린드롬', description: '문자열 처리 및 동적 계획법 기초', language: 'Java', solveCount: 12453, testType: '기본 코딩테스트', difficulty: '중급', type: '문자열' },
        { id: 2, title: '두 수의 합', description: '해시맵을 활용한 O(n) 탐색', language: 'Python', solveCount: 45120, testType: '대기업 코딩 테스트', difficulty: '초급', type: '배열' },
        { id: 3, title: 'K개 정렬 리스트 병합', description: '우선순위 큐와 분할 정복 알고리즘', language: 'C++', solveCount: 8921, testType: '실무 코드테스트', difficulty: '고급', type: '정렬' },
        { id: 4, title: '유효한 괄호', description: '스택 자료구조의 기본 활용', language: 'Java', solveCount: 32105, testType: '기본 코딩테스트', difficulty: '초급', type: '구현' },
        { id: 5, title: '단어 사다리', description: 'BFS를 이용한 최단 경로 탐색', language: 'Python', solveCount: 15890, testType: '실무 코드테스트', difficulty: '중급', type: 'DFS/BFS' },
        { id: 6, title: '계단 오르기', description: '동적 계획법 점화식 도출 연습', language: 'C++', solveCount: 28450, testType: '기본 코딩테스트', difficulty: '초급', type: 'DP' },
        { id: 7, title: '섬의 개수', description: '2차원 배열에서의 DFS/BFS 탐색', language: 'Java', solveCount: 41200, testType: '대기업 코딩 테스트', difficulty: '중급', type: 'DFS/BFS' },
        { id: 8, title: '타겟 넘버', description: '완전 탐색을 위한 재귀 호출 응용', language: 'Kotlin', solveCount: 19834, testType: '실무 코드테스트', difficulty: '고급', type: 'DFS/BFS' },
    ];

    const dummyUserProgress: UserProgress[] = [
        { userId: 123, problemId: 1, status: 'completed' },   // 현재 유저(123) 기록
        { userId: 123, problemId: 2, status: 'in-progress' }, // 현재 유저(123) 기록
        { userId: 123, problemId: 3, status: 'in-progress' }, 
        { userId: 999, problemId: 1, status: 'completed' }    // 다른 유저(999) 기록
    ];

    const CURRENT_USER_ID = 123; // 실제로는 로그인 정보에서 가져오게 됩니다.

    // 3. 내 기록만 필터링하여 합치기
    const mergedProblems: Problem[] = dummyBaseProblems.map(problem => {
        const myProgress = dummyUserProgress.find(
            p => p.problemId === problem.id && p.userId === CURRENT_USER_ID
        );

        return {
            ...problem,
            status: myProgress ? myProgress.status : 'not-started',
        };
    });

    return { problems: mergedProblems };
};