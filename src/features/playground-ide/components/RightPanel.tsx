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
  isDarkMode: boolean;
}

export function RightPanel({
  activeTab,
  selectedLanguage,
  selectedTemplate,
  notes,
  onTabChange,
  onNotesChange,
  isDarkMode,
}: RightPanelProps) {
  return (
    <div className={`w-72 border-l flex flex-col shrink-0 ${isDarkMode ? 'bg-gray-950 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
      {/* 탭 */}
      <div className={`border-b flex ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <button
          onClick={() => onTabChange('cheatsheet')}
          className={`flex-1 px-4 py-3 text-xs font-medium transition-all border-b-2 ${
            activeTab === 'cheatsheet'
              ? isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'
              : isDarkMode ? 'text-gray-400 border-transparent hover:text-gray-300' : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Cheat Sheet
        </button>
        <button
          onClick={() => onTabChange('notes')}
          className={`flex-1 px-4 py-3 text-xs font-medium transition-all border-b-2 ${
            activeTab === 'notes'
              ? isDarkMode ? 'text-purple-400 border-purple-400' : 'text-purple-600 border-purple-600'
              : isDarkMode ? 'text-gray-400 border-transparent hover:text-gray-300' : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Notes
        </button>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {activeTab === 'cheatsheet' ? (
          <div className="space-y-3">
            <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>
              {selectedTemplate === 'none'
                ? `${LANGUAGE_CONFIGS[selectedLanguage].name} Syntax`
                : `${PROJECT_TEMPLATES[selectedTemplate].name}`}
            </h3>
            {selectedTemplate === 'none' ? (
              LANGUAGE_CONFIGS[selectedLanguage].cheatSheet.map((item: string, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded border text-xs transition cursor-pointer ${isDarkMode 
                    ? 'bg-gray-800 border-gray-700 text-gray-300 hover:border-purple-500' 
                    : 'bg-white border-gray-300 text-gray-900 hover:border-purple-400'}`}
                >
                  {item}
                </div>
              ))
            ) : (
              <div className={`p-3 rounded border text-xs ${isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-300' 
                : 'bg-white border-gray-300 text-gray-900'}`}>
                <p className="mb-2">{PROJECT_TEMPLATES[selectedTemplate].description}</p>
                <p className={isDarkMode ? 'text-gray-500' : 'text-gray-600'}>
                  파일 수: {PROJECT_TEMPLATES[selectedTemplate].files.length}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>My Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Write your notes here..."
              className={`w-full h-full px-3 py-2 rounded border text-xs resize-none focus:outline-none ${isDarkMode 
                ? 'bg-gray-800 text-gray-300 border-gray-700 focus:border-purple-500 placeholder-gray-600' 
                : 'bg-white text-gray-900 border-gray-300 focus:border-purple-400 placeholder-gray-400'}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}