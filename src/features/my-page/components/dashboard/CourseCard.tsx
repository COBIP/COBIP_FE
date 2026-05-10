// src/features/dashboard/components/CourseCard.tsx
import { Share2, ChevronRight } from 'lucide-react';
import type { RecommendedCourse } from '@/app/types/DashboardTypes';

interface CourseCardProps {
  course: RecommendedCourse;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition flex flex-col h-full">
      <div className="flex items-start justify-between mb-1">
        <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{course.title}</h3>
        <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 cursor-pointer flex-shrink-0">
          <ChevronRight size={16} className="text-gray-400" />
        </div>
      </div>

      <p className="text-xs text-gray-600 mb-3 line-clamp-2 min-h-[32px]">{course.description}</p>

      <p className="text-xs text-gray-500 mb-4">{course.releaseDate}</p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-auto">
        <button className="text-xs text-purple-600 font-semibold hover:text-purple-700">
          템플릿 상세보기
        </button>
        <button className="p-1.5 hover:bg-gray-100 rounded-lg transition">
          <Share2 size={16} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}