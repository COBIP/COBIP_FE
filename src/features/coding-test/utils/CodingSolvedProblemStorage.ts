const CODING_SOLVED_PROBLEM_IDS_STORAGE_KEY = 'cobip:coding-test:solved-problem-ids';
const CODING_SOLVED_PROBLEM_IDS_EVENT = 'cobip:coding-test:solved-problem-ids-changed';

export function getCodingSolvedProblemIds() {
    if (typeof window === 'undefined') return new Set<number>();

    try {
        const rawValue = window.localStorage.getItem(CODING_SOLVED_PROBLEM_IDS_STORAGE_KEY);
        const parsedValue = rawValue ? JSON.parse(rawValue) : [];

        if (!Array.isArray(parsedValue)) return new Set<number>();

        return new Set(parsedValue.map((value) => Number(value)).filter((value) => Number.isInteger(value)));
    } catch {
        return new Set<number>();
    }
}

export function getCodingSolvedProblemIdsSnapshot() {
    return [...getCodingSolvedProblemIds()].sort((left, right) => left - right).join(',');
}

export function checkCodingProblemStoredSolved(problemId: number, solvedProblemIdsSnapshot: string) {
    return solvedProblemIdsSnapshot
        .split(',')
        .filter(Boolean)
        .some((storedProblemId) => Number(storedProblemId) === problemId);
}

export function syncCodingSolvedProblemIds(onStoreChange: () => void) {
    if (typeof window === 'undefined') return () => undefined;

    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === CODING_SOLVED_PROBLEM_IDS_STORAGE_KEY) {
            onStoreChange();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CODING_SOLVED_PROBLEM_IDS_EVENT, onStoreChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener(CODING_SOLVED_PROBLEM_IDS_EVENT, onStoreChange);
    };
}

export function setCodingSolvedProblemId(problemId: number) {
    const solvedProblemIds = getCodingSolvedProblemIds();
    solvedProblemIds.add(problemId);

    if (typeof window !== 'undefined') {
        window.localStorage.setItem(CODING_SOLVED_PROBLEM_IDS_STORAGE_KEY, JSON.stringify([...solvedProblemIds]));
        window.dispatchEvent(new Event(CODING_SOLVED_PROBLEM_IDS_EVENT));
    }

    return solvedProblemIds;
}
