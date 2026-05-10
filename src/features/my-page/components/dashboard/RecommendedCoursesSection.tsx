// src/features/dashboard/components/RecommendedCoursesSection.tsx
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
        <h2 className="text-lg font-bold text-gray-900">인기 템플릿</h2>
        {/* 전체 템플릿 목록으로 이동하도록 링크를 연결할 수 있습니다 */}
        <button className="text-sm text-purple-600 font-semibold hover:text-purple-700">
          더 많은 템플릿 보기 →
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length === 0 ? (
          <p className="text-sm text-gray-500 col-span-full text-center py-10">추천할 템플릿이 아직 없습니다.</p>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </div>
    </div>
  );
}