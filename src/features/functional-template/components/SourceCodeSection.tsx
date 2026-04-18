import { Code } from 'lucide-react';
import { useState } from 'react';

export function SourceCodeSection() {
  const [activeTab, setActiveTab] = useState('package.json');
  const tabs = ['package.json', 'route.ts', 'auth.ts'];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Code className="text-purple-600" size={28} />
        <h2 className="text-2xl font-bold text-gray-900">전체 소스코드</h2>
      </div>
      <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800">
        <div className="flex bg-gray-800 border-b border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium transition ${
                activeTab === tab
                  ? 'border-b-2 border-purple-500 text-white'
                  : 'text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6">
          <pre className="font-mono text-sm text-gray-300">{`// Code content`}</pre>
        </div>
      </div>
    </div>
  );
}