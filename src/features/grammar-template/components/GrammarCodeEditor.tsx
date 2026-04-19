interface GrammarCodeEditorProps {
  code?: string;
  currentLine?: number;
}

export function GrammarCodeEditor({
  code = `total = 0
values = [3, 7, 2, 5]

for value in values:
    total += value
    print(f"Current: {value}, Total: {total}")`,
  currentLine = 4,
}: GrammarCodeEditorProps) {
  const lines = code.split('\n');

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 h-full flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-3 py-2">
        <p className="text-xs text-gray-400 font-mono">script.py</p>
      </div>

      <div className="flex-1 overflow-auto p-3">
        <div className="font-mono text-xs leading-relaxed">
          {lines.map((line, idx) => (
            <div
              key={idx}
              className={`flex gap-3 transition ${
                currentLine === idx + 1 ? 'bg-blue-900 bg-opacity-30' : ''
              }`}
            >
              <span className="text-gray-600 w-6 text-right shrink-0 select-none">
                {idx + 1}
              </span>

              <span className="text-gray-300 flex-1 wrap-break-word">
                {line || ' '}
              </span>

              {currentLine === idx + 1 && (
                <span className="text-blue-400 shrink-0">▶</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}