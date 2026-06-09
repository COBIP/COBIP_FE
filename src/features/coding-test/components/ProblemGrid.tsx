import type { CodingWorkbookProblemSummaryResponse, CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';
import ProblemCard from '@/features/coding-test/components/ProblemCard';

interface ProblemGridProps {
  workbooks: CodingWorkbookSummaryResponse[];
  getWorkbookProblems?: (workbookId: number) => CodingWorkbookProblemSummaryResponse[];
}

export default function ProblemGrid({ workbooks, getWorkbookProblems }: ProblemGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workbooks.map((workbook) => (
                <ProblemCard
                    key={workbook.id}
                    workbook={workbook}
                    problems={getWorkbookProblems?.(workbook.id) ?? []}
                />
            ))}
        </div>
    );
}
