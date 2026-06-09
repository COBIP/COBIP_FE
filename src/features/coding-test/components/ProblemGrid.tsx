import type { CodingProblemListItem } from '@/types/CodingWorkbookTypes';
import ProblemCard from '@/features/coding-test/components/ProblemCard';

interface ProblemGridProps {
  problems: CodingProblemListItem[];
}

export default function ProblemGrid({ problems }: ProblemGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problems.map(({ workbook, problem }) => (
                <ProblemCard
                    key={problem.id}
                    workbook={workbook}
                    problem={problem}
                />
            ))}
        </div>
    );
}
