import { createElement, useEffect, useMemo, useState } from 'react';
import {
  Box,
  ChevronLeft,
  ChevronRight,
  Code2,
  GitBranch,
  Pause,
  Play,
  RefreshCw,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type {
  ExecutionFlowOutputSnapshot,
  ExecutionFlowStep,
  ExecutionFlowVariableSnapshot,
} from '@/features/grammar-template/Constants';

interface ExecutionFlowPanelProps {
  steps: ExecutionFlowStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  onClose?: () => void;
}

type VariableState = {
  name: string;
  value: string;
  valueSource: string;
  dataType?: string;
  lineNumber: number;
  stepOrder: number;
  status: 'created' | 'updated';
  elements?: string[];
  activeIndex?: number | null;
};

type OutputState = {
  value: string;
  source: string;
  lineNumber: number;
  stepOrder: number;
};

type VisualState = {
  variables: VariableState[];
  outputs: OutputState[];
  activeVariable?: VariableState;
  activeOutput?: OutputState;
};

const EVENT_META: Record<
  ExecutionFlowStep['eventType'],
  { label: string; Icon: LucideIcon; badgeClass: string; activeClass: string }
> = {
  OUTPUT: {
    label: '출력',
    Icon: Terminal,
    badgeClass: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    activeClass: 'border-emerald-300 bg-emerald-50',
  },
  CONDITION: {
    label: '조건',
    Icon: GitBranch,
    badgeClass: 'bg-amber-50 text-amber-700 ring-amber-200',
    activeClass: 'border-amber-300 bg-amber-50',
  },
  LOOP: {
    label: '반복',
    Icon: RefreshCw,
    badgeClass: 'bg-sky-50 text-sky-700 ring-sky-200',
    activeClass: 'border-sky-300 bg-sky-50',
  },
  FUNCTION: {
    label: '함수',
    Icon: Code2,
    badgeClass: 'bg-violet-50 text-violet-700 ring-violet-200',
    activeClass: 'border-violet-300 bg-violet-50',
  },
  ASSIGNMENT: {
    label: '변수',
    Icon: Box,
    badgeClass: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
    activeClass: 'border-cyan-300 bg-cyan-50',
  },
  LINE: {
    label: '실행',
    Icon: Sparkles,
    badgeClass: 'bg-slate-100 text-slate-600 ring-slate-200',
    activeClass: 'border-slate-300 bg-white',
  },
};

function formatExpression(expression: string) {
  return expression
    .trim()
    .replace(/;$/, '')
    .trim();
}

function formatUnquotedValue(value: string) {
  const trimmed = formatExpression(value);
  const quote = trimmed[0];
  if ((quote === '"' || quote === "'" || quote === '`') && trimmed.endsWith(quote)) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function calculateExpressionValue(expression: string, variables: Map<string, VariableState>): string {
  const cleaned = formatExpression(expression);
  if (!cleaned) return '';

  if (/^["'`].*["'`]$/.test(cleaned)) {
    return formatUnquotedValue(cleaned);
  }

  const variable = variables.get(cleaned);
  if (variable) return variable.value;

  if (cleaned.includes('+')) {
    return cleaned
      .split('+')
      .map((part) => calculateExpressionValue(part, variables))
      .join('');
  }

  if (cleaned.includes(',')) {
    return cleaned
      .split(',')
      .map((part) => calculateExpressionValue(part, variables))
      .join(' ');
  }

  return cleaned;
}

function parseAssignment(line: string) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('//') || trimmed.includes('==') || trimmed.includes('!=')) {
    return null;
  }

  const match = trimmed.match(
    /^(?:final\s+)?(?:(int|long|double|float|boolean|char|String|var|let|const)\s+)?([A-Za-z_$][\w$]*)\s*=\s*(.+?)\s*;?$/
  );

  if (!match) return null;

  return {
    dataType: match[1],
    name: match[2],
    expression: formatExpression(match[3]),
  };
}

function parseOutput(line: string) {
  const trimmed = line.trim();
  const javaMatch = trimmed.match(/^System\.out\.print(?:ln)?\((.*)\)\s*;?$/);
  const jsMatch = trimmed.match(/^console\.log\((.*)\)\s*;?$/);
  const pythonMatch = trimmed.match(/^print\((.*)\)\s*$/);

  return javaMatch?.[1] ?? jsMatch?.[1] ?? pythonMatch?.[1] ?? null;
}

function mapVariableState(variable: ExecutionFlowVariableSnapshot): VariableState {
  return {
    name: variable.name,
    value: variable.value,
    valueSource: variable.expression,
    dataType: variable.dataType ?? undefined,
    lineNumber: variable.lineNumber,
    stepOrder: variable.stepOrder,
    status: variable.changeType === 'UPDATED' ? 'updated' : 'created',
    elements: variable.elements,
    activeIndex: variable.activeIndex,
  };
}

function mapOutputState(output: ExecutionFlowOutputSnapshot): OutputState {
  return {
    value: output.value,
    source: output.expression,
    lineNumber: output.lineNumber,
    stepOrder: output.stepOrder,
  };
}

function checkServerVisualState(step?: ExecutionFlowStep) {
  return Boolean(step && (step.activeVariable || step.activeOutput || step.variables || step.outputs));
}

function buildServerVisualState(step: ExecutionFlowStep): VisualState {
  return {
    variables: (step.variables ?? []).map(mapVariableState),
    outputs: (step.outputs ?? []).map(mapOutputState),
    activeVariable: step.activeVariable ? mapVariableState(step.activeVariable) : undefined,
    activeOutput: step.activeOutput ? mapOutputState(step.activeOutput) : undefined,
  };
}

function buildVisualState(steps: ExecutionFlowStep[], currentStepIndex: number): VisualState {
  const currentStep = steps[currentStepIndex];
  if (checkServerVisualState(currentStep)) {
    return buildServerVisualState(currentStep);
  }

  const variableMap = new Map<string, VariableState>();
  const outputs: OutputState[] = [];
  let activeVariable: VariableState | undefined;
  let activeOutput: OutputState | undefined;

  steps.slice(0, currentStepIndex + 1).forEach((step, index) => {
    const assignment = parseAssignment(step.sourceLine);
    if (assignment) {
      const previous = variableMap.get(assignment.name);
      const nextVariable: VariableState = {
        name: assignment.name,
        value: calculateExpressionValue(assignment.expression, variableMap),
        valueSource: assignment.expression,
        dataType: assignment.dataType,
        lineNumber: step.lineNumber,
        stepOrder: step.stepOrder,
        status: previous ? 'updated' : 'created',
      };
      variableMap.set(assignment.name, nextVariable);
      if (index === currentStepIndex) activeVariable = nextVariable;
    }

    const outputExpression = parseOutput(step.sourceLine);
    if (outputExpression !== null) {
      const output: OutputState = {
        value: calculateExpressionValue(outputExpression, variableMap),
        source: formatExpression(outputExpression),
        lineNumber: step.lineNumber,
        stepOrder: step.stepOrder,
      };
      outputs.push(output);
      if (index === currentStepIndex) activeOutput = output;
    }
  });

  return {
    variables: [...variableMap.values()],
    outputs,
    activeVariable,
    activeOutput,
  };
}

function StepBadge({ step, active }: { step: ExecutionFlowStep; active: boolean }) {
  const meta = EVENT_META[step.eventType] ?? EVENT_META.LINE;

  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ring-1 transition ${
        active ? `${meta.badgeClass} scale-105 shadow-sm` : 'bg-white text-slate-500 ring-slate-200'
      }`}
    >
      {createElement(meta.Icon, { className: 'h-4 w-4' })}
    </div>
  );
}

function buildStepTitle(step: ExecutionFlowStep | undefined, visualState: VisualState) {
  if (!step) return '실행 흐름';
  if (visualState.activeVariable?.elements?.length) {
    const index = visualState.activeVariable.activeIndex;
    if (typeof index === 'number') return `${visualState.activeVariable.name}[${index}] 값이 바뀝니다`;
    return `${visualState.activeVariable.name} 구조를 준비합니다`;
  }
  if (visualState.activeVariable) {
    return `${visualState.activeVariable.name} 값이 ${visualState.activeVariable.status === 'created' ? '생성됩니다' : '변경됩니다'}`;
  }
  if (visualState.activeOutput) return '출력 결과를 갱신합니다';
  if (step.eventType === 'LOOP') return '반복문을 한 단계 진행합니다';
  if (step.eventType === 'CONDITION') return '조건문 분기를 확인합니다';
  return '현재 줄을 실행합니다';
}

function buildStepSubtitle(step: ExecutionFlowStep | undefined, visualState: VisualState) {
  if (!step) return '';
  if (visualState.activeVariable) return `${visualState.activeVariable.valueSource} → ${visualState.activeVariable.value}`;
  if (visualState.activeOutput) return visualState.activeOutput.source;
  return step.sourceLine.trim() || step.description;
}

function getLatestOutput(outputs: OutputState[]) {
  return outputs.length ? outputs[outputs.length - 1] : undefined;
}

function formatOutputSourceLabel(output?: OutputState) {
  if (!output) return '';
  return output.source.trim() || '줄바꿈';
}

function ScalarVariableCard({ variable, active }: { variable: VariableState; active: boolean }) {
  return (
    <div
      className={`min-w-0 rounded-lg border bg-white p-3 transition ${
        active ? 'border-cyan-300 shadow-md ring-4 ring-cyan-100' : 'border-slate-200'
      }`}
    >
      <div className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 truncate font-mono text-sm font-bold text-slate-900">{variable.name}</span>
        <span
          className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            variable.status === 'created' ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {variable.status === 'created' ? '생성' : '변경'}
        </span>
      </div>
      <div className="mt-3 flex min-h-14 items-center rounded-md bg-slate-50 px-3 py-2 font-mono text-2xl font-bold text-slate-900">
        {variable.value}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-400">
        <span className="truncate">{variable.dataType ?? 'value'}</span>
        <span className="shrink-0">line {variable.lineNumber}</span>
      </div>
    </div>
  );
}

function CollectionVariablePanel({ variable, active }: { variable: VariableState; active: boolean }) {
  return (
    <section
      className={`rounded-xl border bg-white p-5 transition ${
        active ? 'border-cyan-300 shadow-md ring-4 ring-cyan-100' : 'border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-slate-900">{variable.name}</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
              {variable.elements?.length ?? 0}개
            </span>
            {typeof variable.activeIndex === 'number' && (
              <span className="rounded-md bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700">
                index {variable.activeIndex}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">{variable.valueSource}</p>
        </div>
        <span className="text-[11px] text-slate-400">line {variable.lineNumber}</span>
      </div>

      <div className="mt-5 overflow-x-auto">
        <div className="flex min-w-max gap-3 pb-1">
          {variable.elements?.map((element, index) => (
            <div
              key={`${variable.name}-${index}`}
              className={`flex h-28 w-24 shrink-0 flex-col items-center justify-center rounded-xl border transition ${
                variable.activeIndex === index
                  ? 'border-cyan-400 bg-cyan-100 text-cyan-950 shadow-sm ring-4 ring-cyan-200'
                  : 'border-slate-200 bg-slate-50 text-slate-800'
              }`}
            >
              <span className="font-mono text-[11px] font-semibold text-slate-400">
                {variable.name}[{index}]
              </span>
              <span className="mt-3 max-w-20 truncate font-mono text-3xl font-bold">{element}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ExecutionFlowPanel({ steps, currentStepIndex, onStepClick, onClose }: ExecutionFlowPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const activeStep = steps[currentStepIndex];
  const visualState = useMemo(() => buildVisualState(steps, currentStepIndex), [steps, currentStepIndex]);
  const activeMeta = activeStep ? EVENT_META[activeStep.eventType] ?? EVENT_META.LINE : EVENT_META.LINE;
  const stepTitle = buildStepTitle(activeStep, visualState);
  const stepSubtitle = buildStepSubtitle(activeStep, visualState);
  const isAutoPlaying = isPlaying && currentStepIndex < steps.length - 1;
  const latestOutput = getLatestOutput(visualState.outputs);
  const consoleOutput = visualState.activeOutput ?? latestOutput;

  useEffect(() => {
    if (!isAutoPlaying || steps.length === 0) return undefined;

    const timer = window.setTimeout(() => {
      onStepClick(currentStepIndex + 1);
    }, 900);

    return () => window.clearTimeout(timer);
  }, [currentStepIndex, isAutoPlaying, onStepClick, steps.length]);

  const moveStep = (nextIndex: number) => {
    setIsPlaying(false);
    onStepClick(Math.min(Math.max(nextIndex, 0), Math.max(steps.length - 1, 0)));
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-50">
      <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-bold text-slate-900">{stepTitle}</p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {stepSubtitle}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              {steps.length ? `${currentStepIndex + 1} / ${steps.length}` : '0 / 0'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => moveStep(currentStepIndex - 1)}
              disabled={currentStepIndex <= 0}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              title="이전"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsPlaying((current) => !current)}
              disabled={steps.length <= 1 || currentStepIndex >= steps.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              title={isAutoPlaying ? '일시정지' : '재생'}
            >
              {isAutoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
            </button>
            <button
              type="button"
              onClick={() => moveStep(currentStepIndex + 1)}
              disabled={currentStepIndex >= steps.length - 1}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
              title="다음"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="ml-1 flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="닫기"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all duration-300"
            style={{ width: `${steps.length ? ((currentStepIndex + 1) / steps.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {activeStep && (
          <section className={`rounded-lg border p-3 shadow-sm transition ${activeMeta.activeClass}`}>
            <div className="flex items-start gap-3">
              <StepBadge step={activeStep} active />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-900">{activeMeta.label}</span>
                  <span className="rounded bg-white/70 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                    line {activeStep.lineNumber}
                  </span>
                </div>
                <code className="mt-2 block rounded bg-white/80 px-2 py-1.5 font-mono text-xs text-slate-900">
                  {activeStep.sourceLine}
                </code>
                <p className="mt-2 text-xs leading-5 text-slate-600">{activeStep.description}</p>
              </div>
            </div>
          </section>
        )}

        <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-4 w-4 text-cyan-600" />
              <span className="text-xs font-bold text-slate-900">변수 상태</span>
            </div>
            <span className="text-[10px] text-slate-400">{visualState.variables.length}</span>
          </div>
          {visualState.variables.length ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,12rem))] gap-2">
              {visualState.variables.map((variable) =>
                variable.elements?.length ? (
                  <div key={variable.name} className="col-span-full">
                    <CollectionVariablePanel
                      variable={variable}
                      active={visualState.activeVariable?.name === variable.name}
                    />
                  </div>
                ) : (
                  <ScalarVariableCard
                    key={variable.name}
                    variable={variable}
                    active={visualState.activeVariable?.name === variable.name}
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-xs text-slate-400">
              아직 생성된 변수가 없습니다.
            </div>
          )}
        </section>

        <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-900">출력</span>
            </div>
            <span className="text-[10px] text-slate-400">{visualState.outputs.length}회</span>
          </div>
          {consoleOutput ? (
            <div
              className={`rounded-md border p-3 transition ${
                visualState.activeOutput ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100' : 'border-slate-200 bg-slate-950'
              }`}
            >
              <pre
                className={`min-h-24 max-h-64 overflow-auto whitespace-pre font-mono text-sm leading-6 ${
                  visualState.activeOutput ? 'text-emerald-900' : 'text-emerald-200'
                }`}
              >
                {consoleOutput.value}
              </pre>
              <div
                className={`mt-2 flex flex-wrap items-center justify-between gap-2 text-[10px] ${
                  visualState.activeOutput ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                <span>{visualState.activeOutput ? '현재 출력문' : '마지막 출력 상태'}</span>
                <code className="font-mono">{formatOutputSourceLabel(consoleOutput)}</code>
              </div>
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-xs text-slate-400">
              아직 출력이 없습니다.
            </div>
          )}
        </section>

        <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-900">타임라인</p>
            <span className="text-[10px] text-slate-400">{currentStepIndex + 1} / {steps.length}</span>
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {steps.map((step, index) => {
              const meta = EVENT_META[step.eventType] ?? EVENT_META.LINE;
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <button
                  key={step.stepOrder}
                  type="button"
                  onClick={() => moveStep(index)}
                  className={`flex h-9 min-w-12 items-center justify-center rounded-md border px-2 text-[11px] font-semibold transition ${
                    isActive
                      ? `${meta.badgeClass} border-transparent`
                      : isPast
                        ? 'border-slate-200 bg-slate-100 text-slate-500'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                  }`}
                  title={step.sourceLine}
                >
                  {step.stepOrder}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
