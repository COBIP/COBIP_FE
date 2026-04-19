"use client";

import { useState } from 'react';
import { GrammarLeftSidebar } from '@/features/grammar-template/components/GrammarLeftSidebar';
import { GrammarRightSidebar } from '@/features/grammar-template/components/GrammarRightSidebar';
import { GrammarCodeEditor } from '@/features/grammar-template/components/GrammarCodeEditor';
import { GrammarVisualizationPanel } from '@/features/grammar-template/components/GrammarVisualizationPanel';

interface TopicScenario {
  title: string;
  subtitle: string;
  code: string;
  currentLine: number;
  stepDescription: string;
  variables: Array<{ name: string; value: string | number; type: string }>;
  arrayValues: Array<{ index: number; value: string | number }>;
  currentIndex: number;
  outputLines: string[];
  currentStep: number;
  totalSteps: number;
}

const topicScenarios: Record<string, TopicScenario> = {
  variables: {
    title: '변수 선언',
    subtitle: 'Python으로 변수 선언과 값 할당을 익혀요',
    code: `name = "COBIP"
count = 3
is_active = True
print(name, count, is_active)`,
    currentLine: 2,
    stepDescription: 'count 변수에 숫자 3을 할당한다',
    variables: [
      { name: 'name', value: 'COBIP', type: 'string' },
      { name: 'count', value: 3, type: 'number' },
      { name: 'is_active', value: 'True', type: 'bool' },
    ],
    arrayValues: [
      { index: 0, value: 'name' },
      { index: 1, value: 'count' },
      { index: 2, value: 'is_active' },
      { index: 3, value: '-' },
    ],
    currentIndex: 1,
    outputLines: ['COBIP 3 True'],
    currentStep: 2,
    totalSteps: 4,
  },
  conditions: {
    title: '조건문',
    subtitle: 'if/else 분기 흐름을 따라가요',
    code: `score = 72

if score >= 80:
    result = "합격"
else:
    result = "불합격"

print(result)`,
    currentLine: 6,
    stepDescription: '조건이 거짓이므로 else 블록이 실행된다',
    variables: [
      { name: 'score', value: 72, type: 'number' },
      { name: 'result', value: '불합격', type: 'string' },
    ],
    arrayValues: [
      { index: 0, value: 'score>=80' },
      { index: 1, value: 'False' },
      { index: 2, value: 'else' },
      { index: 3, value: 'run' },
    ],
    currentIndex: 1,
    outputLines: ['불합격'],
    currentStep: 3,
    totalSteps: 4,
  },
  loops: {
    title: '반복문',
    subtitle: 'for 루프에서 누적값이 변하는 과정을 확인해요',
    code: `values = [3, 7, 2, 5]
total = 0

for value in values:
    total += value
    print(f"Current: {value}, Total: {total}")`,
    currentLine: 5,
    stepDescription: '두 번째 원소 7을 더해 total이 10이 된다',
    variables: [
      { name: 'value', value: 7, type: 'number' },
      { name: 'total', value: 10, type: 'number' },
    ],
    arrayValues: [
      { index: 0, value: 3 },
      { index: 1, value: 7 },
      { index: 2, value: 2 },
      { index: 3, value: 5 },
    ],
    currentIndex: 1,
    outputLines: ['Current: 3, Total: 3', 'Current: 7, Total: 10'],
    currentStep: 2,
    totalSteps: 4,
  },
  functions: {
    title: '함수',
    subtitle: '함수 정의와 호출 결과를 확인해요',
    code: `def add(a, b):
    return a + b

result = add(4, 6)
print(result)`,
    currentLine: 4,
    stepDescription: 'add(4, 6)을 호출해 result에 10을 저장한다',
    variables: [
      { name: 'a', value: 4, type: 'number' },
      { name: 'b', value: 6, type: 'number' },
      { name: 'result', value: 10, type: 'number' },
    ],
    arrayValues: [
      { index: 0, value: 'a=4' },
      { index: 1, value: 'b=6' },
      { index: 2, value: 'return' },
      { index: 3, value: 10 },
    ],
    currentIndex: 3,
    outputLines: ['10'],
    currentStep: 4,
    totalSteps: 4,
  },
};

export default function GrammarTemplateDetail() {
  const [activeLevel, setActiveLevel] = useState('variables');
  const currentScenario = topicScenarios[activeLevel] || topicScenarios.variables;

  return (
    <div className="flex h-screen bg-gray-50">
      <GrammarLeftSidebar
        currentTopic={activeLevel}
        activeLevel={activeLevel}
        onLevelChange={setActiveLevel}
      />

      <main className="flex flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-gray-200 bg-white px-8 py-6">
          <p className="mb-2 text-sm text-gray-500">{currentScenario.subtitle}</p>
          <h1 className="text-3xl font-bold text-gray-900">{currentScenario.title}</h1>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="mb-4 text-lg font-bold text-gray-900">코드</h2>
              <div className="h-80 overflow-hidden rounded-lg">
                <GrammarCodeEditor
                  code={currentScenario.code}
                  currentLine={currentScenario.currentLine}
                />
              </div>
            </div>

            <div>
              <GrammarVisualizationPanel
                currentStep={currentScenario.currentStep}
                totalSteps={currentScenario.totalSteps}
                stepDescription={currentScenario.stepDescription}
                variables={currentScenario.variables}
                arrayValues={currentScenario.arrayValues}
                currentIndex={currentScenario.currentIndex}
                outputLines={currentScenario.outputLines}
              />
            </div>
          </div>
        </div>
      </main>

      <GrammarRightSidebar levelTitle={currentScenario.title} />
    </div>
  );
}
