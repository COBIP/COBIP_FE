import type { BaseProblem, UserProgress, Problem } from '@/types/CodingTestTypes';

export const useCodingTest = () => {
    const dummyBaseProblems: BaseProblem[] = [
        { id: 1, title: '가장 긴 팰린드롬', description: '문자열 처리 및 동적 계획법 기초', language: 'Java', solveCount: 12453, testType: '기본 코딩테스트', difficulty: '중급', type: '문자열' },
        { id: 2, title: '두 수의 합', description: '해시맵을 활용한 O(n) 탐색', language: 'Python', solveCount: 45120, testType: '대기업 코딩 테스트', difficulty: '초급', type: '배열' },
        { id: 3, title: 'K개 정렬 리스트 병합', description: '우선순위 큐와 분할 정복 알고리즘', language: 'C++', solveCount: 8921, testType: '실무 코드테스트', difficulty: '고급', type: '정렬' },
        { id: 4, title: '유효한 괄호', description: '스택 자료구조의 기본 활용', language: 'Java', solveCount: 32105, testType: '기본 코딩테스트', difficulty: '초급', type: '구현' },
        { id: 5, title: '단어 사다리', description: 'BFS를 이용한 최단 경로 탐색', language: 'Python', solveCount: 15890, testType: '실무 코드테스트', difficulty: '중급', type: 'DFS/BFS' },
        { id: 6, title: '계단 오르기', description: '동적 계획법 점화식 도출 연습', language: 'C++', solveCount: 28450, testType: '기본 코딩테스트', difficulty: '초급', type: 'DP' },
        { id: 7, title: '섬의 개수', description: '2차원 배열에서의 DFS/BFS 탐색', language: 'Java', solveCount: 41200, testType: '대기업 코딩 테스트', difficulty: '중급', type: 'DFS/BFS' },
        { id: 8, title: '타겟 넘버', description: '완전 탐색을 위한 재귀 호출 응용', language: 'Kotlin', solveCount: 19834, testType: '실무 코드테스트', difficulty: '고급', type: 'DFS/BFS' },
        { id: 9, title: '네트워크', description: '그래프 연결 요소 개수 구하기', language: 'Spring', solveCount: 14560, testType: '실무 코드테스트', difficulty: '중급', type: 'DFS/BFS' },
        { id: 10, title: '단어 변환', description: '상태 공간 트리를 이용한 탐색', language: 'React', solveCount: 11230, testType: '대기업 코딩 테스트', difficulty: '고급', type: '문자열' },
        { id: 11, title: '여행경로', description: '오일러 경로 찾기 알고리즘', language: 'Vue.js', solveCount: 9800, testType: '기본 코딩테스트', difficulty: '고급', type: 'DFS/BFS' },
        { id: 12, title: 'H-Index', description: '정렬을 활용한 데이터 분석 최적화', language: 'Nest', solveCount: 18400, testType: '실무 코드테스트', difficulty: '중급', type: '정렬' },
        { id: 13, title: '가장 큰 수', description: '커스텀 정렬자 구현 및 문자열 조작', language: 'Java', solveCount: 25600, testType: '대기업 코딩 테스트', difficulty: '중급', type: '정렬' },
        { id: 14, title: '완주하지 못한 선수', description: '해시 자료구조의 효율적 사용법', language: 'Python', solveCount: 52100, testType: '기본 코딩테스트', difficulty: '입문', type: '배열' },
        { id: 15, title: '주식 가격', description: '스택을 활용한 구간 계산 알고리즘', language: 'C++', solveCount: 33400, testType: '대기업 코딩 테스트', difficulty: '초급', type: '구현' },
        { id: 16, title: '기능 개발', description: '큐 자료구조를 이용한 시뮬레이션', language: 'Java', solveCount: 48900, testType: '실무 코드테스트', difficulty: '중급', type: '구현' },
        // --- 16개 초과 페이징 테스트용 데이터 ---
        { id: 17, title: '체육복', description: '그리디 알고리즘의 기초', language: 'Python', solveCount: 65400, testType: '기본 코딩테스트', difficulty: '입문', type: '배열' },
        { id: 18, title: '모의고사', description: '완전탐색(Brute-Force) 구현', language: 'Java', solveCount: 58200, testType: '기본 코딩테스트', difficulty: '입문', type: '구현' },
        { id: 19, title: 'K번째수', description: '배열 자르기와 정렬 활용', language: 'Kotlin', solveCount: 41200, testType: '기본 코딩테스트', difficulty: '입문', type: '정렬' },
        { id: 20, title: '입국심사', description: '이분탐색을 활용한 최적화', language: 'C++', solveCount: 12500, testType: '대기업 코딩 테스트', difficulty: '고급', type: '구현' },
        { id: 21, title: '징검다리', description: '거리의 최솟값을 최대로 만드는 이분탐색', language: 'Java', solveCount: 8900, testType: '대기업 코딩 테스트', difficulty: '고급', type: '구현' },
        { id: 22, title: 'N으로 표현', description: '동적계획법을 활용한 사칙연산', language: 'Python', solveCount: 15600, testType: '실무 코드테스트', difficulty: '중급', type: 'DP' },
        { id: 23, title: '정수 삼각형', description: '위에서 아래로 내려오는 DP 최적해', language: 'Java', solveCount: 21300, testType: '기본 코딩테스트', difficulty: '중급', type: 'DP' },
        { id: 24, title: '구명보트', description: '투포인터와 그리디 알고리즘 조합', language: 'C++', solveCount: 29800, testType: '실무 코드테스트', difficulty: '초급', type: '배열' }
    ];

    const dummyUserProgress: UserProgress[] = [
        { userId: 123, problemId: 1, status: 'completed' }, //현재 유저 기록
        { userId: 123, problemId: 2, status: 'in-progress' },
        { userId: 123, problemId: 17, status: 'completed' },
        { userId: 123, problemId: 24, status: 'in-progress' },
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