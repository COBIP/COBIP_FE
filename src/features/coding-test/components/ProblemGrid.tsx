import { Problem } from '@/types/CodingTestTypes';
import { ProblemCard } from '@/features/coding-test/components/ProblemCard';

interface ProblemGridProps {
  problems: Problem[];
}

export const ProblemGrid = ({ problems }: ProblemGridProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {problems.map((problem) => (
            <ProblemCard key={problem.id} problem={problem} />
        ))}
        </div>
    );
};