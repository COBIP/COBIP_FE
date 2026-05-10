import { CourseCard } from './CourseCard';
import type { RecommendedCourse } from '@/app/types/DashboardTypes';

interface RecommendedCoursesSectionProps {
  courses: RecommendedCourse[];
}

export function RecommendedCoursesSection({
  courses,
}: RecommendedCoursesSectionProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">획득한 수료증</h2>
        <button className="text-sm text-purple-600 font-semibold hover:text-purple-700">
          내 수료증 보기 →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}