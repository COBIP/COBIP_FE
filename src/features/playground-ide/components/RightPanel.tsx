'use client';

import { type Language, type ProjectTemplate, type RightPanelTab } from '@/app/types/Playground';
import { LANGUAGE_CONFIGS } from '@/data/Languages';
import { PROJECT_TEMPLATES } from '@/data/Templates';

interface RightPanelProps {
  activeTab: RightPanelTab;
  selectedLanguage: Language;
  selectedTemplate: ProjectTemplate;
  notes: string;
  onTabChange: (tab: RightPanelTab) => void;
  onNotesChange: (notes: string) => void;
}

export function RightPanel({
  activeTab,
  selectedLanguage,
  selectedTemplate,
  notes,
  onTabChange,
  onNotesChange,
}: RightPanelProps) {
  return (
    <div className="w-72 border-l border-gray-700 flex flex-col bg-gray-950 shrink-0">
      {/* 탭 */}
      <div className="bg-gray-800 border-b border-gray-700 flex">
        <button
          onClick={() => onTabChange('cheatsheet')}
          className={`flex-1 px-4 py-3 text-xs font-medium transition-all border-b-2 ${
            activeTab === 'cheatsheet'
              ? 'text-purple-400 border-purple-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Cheat Sheet
        </button>
        <button
          onClick={() => onTabChange('notes')}
          className={`flex-1 px-4 py-3 text-xs font-medium transition-all border-b-2 ${
            activeTab === 'notes'
              ? 'text-purple-400 border-purple-400'
              : 'text-gray-400 border-transparent hover:text-gray-300'
          }`}
        >
          Notes
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'cheatsheet' ? (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-purple-400 mb-4">
              {selectedTemplate === 'none'
                ? `${LANGUAGE_CONFIGS[selectedLanguage].name} Syntax`
                : `${PROJECT_TEMPLATES[selectedTemplate].name}`}
            </h3>
            {selectedTemplate === 'none' ? (
              LANGUAGE_CONFIGS[selectedLanguage].cheatSheet.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 bg-gray-800 rounded border border-gray-700 text-xs text-gray-300 hover:border-purple-500 transition cursor-pointer"
                >
                  {item}
                </div>
              ))
            ) : (
              <div className="p-3 bg-gray-800 rounded border border-gray-700 text-xs text-gray-300">
                <p className="mb-2">{PROJECT_TEMPLATES[selectedTemplate].description}</p>
                <p className="text-gray-500">
                  파일 수: {PROJECT_TEMPLATES[selectedTemplate].files.length}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-sm font-semibold text-purple-400 mb-4">My Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full h-full px-3 py-2 bg-gray-800 text-gray-300 text-xs rounded border border-gray-700 resize-none focus:outline-none focus:border-purple-500 placeholder-gray-600"
            />
          </div>
        )}
      </div>
    </div>
  );
}