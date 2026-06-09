import type { CodingWorkbookSummaryResponse } from '@/types/CodingWorkbookTypes';
import ProblemCard from '@/features/coding-test/components/ProblemCard';

interface ProblemGridProps {
  workbooks: CodingWorkbookSummaryResponse[];
  onSelectWorkbook: (workbookId: number) => void;
}

export default function ProblemGrid({ workbooks, onSelectWorkbook }: ProblemGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workbooks.map((workbook) => (
                <ProblemCard
                    key={workbook.id}
                    workbook={workbook}
                    onSelect={() => onSelectWorkbook(workbook.id)}
                />
            ))}
        </div>
    );
}
