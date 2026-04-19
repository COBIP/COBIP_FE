"use client";

import { X } from 'lucide-react';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategories: string[];
  onSelectCategories: (categories: string[]) => void;
}

export default function CategoryModal({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onSelectCategories,
}: CategoryModalProps) {
  if (!isOpen) return null;

  const handleToggleCategory = (category: string) => {
    onSelectCategories(
      selectedCategories.includes(category)
        ? selectedCategories.filter(c => c !== category)
        : [...selectedCategories, category]
    );
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <>
      {/* 배경 */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between">
            <h2 className="text-lg font-bold">카테고리 선택</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 목록 */}
          <div className="px-6 py-4 space-y-3">
            {categories.map(category => (
              <label
                key={category}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleToggleCategory(category)}
                  className="w-5 h-5"
                />
                <span className="font-medium">{category}</span>
              </label>
            ))}
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex gap-3">
            {/* 취소 */}
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-100"
            >
              취소
            </button>

            {/* 적용 */}
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              적용
            </button>
          </div>
        </div>
      </div>
    </>
  );
}