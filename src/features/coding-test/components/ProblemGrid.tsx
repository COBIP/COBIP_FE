// src/features/coding-test/components/ProblemGrid.tsx
import type { CodingWorkbookSummary } from '@/types/CodingWorkbookTypes';
import ProblemCard from '@/features/coding-test/components/ProblemCard';

interface ProblemGridProps {
  workbooks: CodingWorkbookSummary[];
}

export default function ProblemGrid({ workbooks }: ProblemGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workbooks.map((workbook) => (
                <ProblemCard key={workbook.id} workbook={workbook} />
            ))}
        </div>
    );
}