export type ProblemStatus = 'completed' | 'in-progress' | 'not-started';

export interface Problem {
    id: number;
    title: string;
    description: string;
    language: string;
    status: ProblemStatus;
    solveCount: number;
    progress?: number;
}