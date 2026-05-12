import type { CodingLanguage } from '@/types/CodingProblemTypes';

const SUPPORTED_LANGUAGES: CodingLanguage[] = ['JAVA', 'PYTHON', 'JAVASCRIPT'];

interface CodeEditorProps {
    selectedLanguage: CodingLanguage;
    changeLanguage: (lang: CodingLanguage) => void;
    sourceCode: string;
    setSourceCode: (code: string) => void;
    resetCode: () => void;
}

export default function CodeEditor({ selectedLanguage, changeLanguage, sourceCode, setSourceCode, resetCode }: CodeEditorProps) {
    return (
        <div className="flex flex-col h-full bg-[#1E1E1E]">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] border-b border-gray-700">
                <select 
                    value={selectedLanguage}
                    onChange={(e) => changeLanguage(e.target.value as CodingLanguage)}
                    className="bg-[#3C3C3C] text-white text-sm rounded px-3 py-1.5 focus:outline-none"
                >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <button onClick={resetCode} className="text-gray-400 hover:text-white text-sm flex items-center gap-1">코드 초기화</button>
            </div>
            <textarea
                value={sourceCode}
                onChange={(e) => setSourceCode(e.target.value)}
                className="flex-grow bg-[#1E1E1E] text-gray-300 p-4 font-mono text-sm focus:outline-none resize-none"
                spellCheck={false}
            />
        </div>
    );
}