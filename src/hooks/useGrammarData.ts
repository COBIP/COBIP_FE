import type { GrammarLevel } from '@/app/types/GrammarTypes';

export function getGrammarData() {
  const levels: GrammarLevel[] = [
    {
      id: 'level-1',
      title: '변수 선언',
      description: 'Python에서 변수를 선언하고 값을 할당하는 방법을 배웁니다.',
      steps: [
        {
          id: 'step-1-1',
          stepNumber: 1,
          title: '첫 번째 변수 선언',
          description: 'total 변수에 0을 할당합니다.',
          code: `values = [4, 7, 9, 2]
total = 0`,
          variables: [
            { name: 'values', value: '[4, 7, 9, 2]', type: 'list' },
            { name: 'total', value: '0', type: 'int' },
          ],
          visualization: {
            variables: [
              { name: 'values', value: '[4, 7, 9, 2]', type: 'list' },
              { name: 'total', value: '0', type: 'int' },
            ],
            currentLine: 2,
            output: [],
            arrayData: [4, 7, 9, 2],
          },
        },
        {
          id: 'step-1-2',
          stepNumber: 2,
          title: '반복문 시작',
          description: 'for 루프를 시작합니다.',
          code: `values = [4, 7, 9, 2]
total = 0

for value in values:
    total += value`,
          variables: [
            { name: 'values', value: '[4, 7, 9, 2]', type: 'list' },
            { name: 'total', value: '0', type: 'int' },
            { name: 'value', value: '4', type: 'int' },
          ],
          visualization: {
            variables: [
              { name: 'values', value: '[4, 7, 9, 2]', type: 'list' },
              { name: 'total', value: '0', type: 'int' },
              { name: 'value', value: '4', type: 'int' },
            ],
            currentLine: 4,
            output: [],
            arrayData: [4, 7, 9, 2],
          },
        },
      ],
    },
    {
      id: 'level-2',
      title: '조건문',
      description: 'if/else 조건문을 사용하여 조건에 따라 다른 코드를 실행합니다.',
      steps: [
        {
          id: 'step-2-1',
          stepNumber: 1,
          title: '조건 확인',
          description: 'if 조건을 확인합니다.',
          code: `score = 72

if score >= 80:
    print("합격")
else:
    print("불합격")`,
          variables: [
            { name: 'score', value: '72', type: 'int' },
          ],
          visualization: {
            variables: [
              { name: 'score', value: '72', type: 'int' },
            ],
            currentLine: 3,
            output: [],
          },
        },
      ],
    },
    {
      id: 'level-3',
      title: '반복문',
      description: 'for 루프를 사용하여 반복적인 작업을 수행합니다.',
      steps: [
        {
          id: 'step-3-1',
          stepNumber: 1,
          title: '반복 시작',
          description: 'for 루프가 시작됩니다.',
          code: `for i in range(5):
    print(i)`,
          variables: [
            { name: 'i', value: '0', type: 'int' },
          ],
          visualization: {
            variables: [
              { name: 'i', value: '0', type: 'int' },
            ],
            currentLine: 1,
            output: [],
          },
        },
      ],
    },
  ];

  return { levels };
}