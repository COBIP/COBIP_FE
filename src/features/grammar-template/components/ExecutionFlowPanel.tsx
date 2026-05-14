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

function VariableCard({ variable, active }: { variable: VariableState; active: boolean }) {
  return (
    <div
      className={`rounded-md border bg-white p-2 transition ${
        active ? 'border-cyan-300 shadow-sm ring-2 ring-cyan-100' : 'border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate font-mono text-xs font-bold text-slate-900">{variable.name}</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
            variable.status === 'created' ? 'bg-cyan-50 text-cyan-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {variable.status === 'created' ? '생성' : '변경'}
        </span>
      </div>
      {variable.elements?.length ? (
        <div className="mt-2 rounded bg-slate-50 p-2">
          <div className="flex flex-wrap gap-1">
            {variable.elements.slice(0, 24).map((element, index) => (
              <div
                key={`${variable.name}-${index}`}
                className={`flex min-h-9 min-w-9 flex-col items-center justify-center rounded border px-1.5 transition ${
                  variable.activeIndex === index
                    ? 'border-cyan-400 bg-cyan-100 text-cyan-900 ring-2 ring-cyan-200'
                    : 'border-slate-200 bg-white text-slate-700'
                }`}
              >
                <span className="font-mono text-[10px] text-slate-400">{index}</span>
                <span className="max-w-12 truncate font-mono text-xs font-semibold">{element}</span>
              </div>
            ))}
          </div>
          {variable.elements.length > 24 && (
            <div className="mt-1 text-[10px] text-slate-400">+{variable.elements.length - 24}</div>
          )}
        </div>
      ) : (
        <div className="mt-1 rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">{variable.value}</div>
      )}
      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-slate-400">
        <span className="truncate">{variable.dataType ?? 'value'}</span>
        <span>line {variable.lineNumber}</span>
      </div>
    </div>
  );
}

export function ExecutionFlowPanel({ steps, currentStepIndex, onStepClick }: ExecutionFlowPanelProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const activeStep = steps[currentStepIndex];
  const visualState = useMemo(() => buildVisualState(steps, currentStepIndex), [steps, currentStepIndex]);
  const activeMeta = activeStep ? EVENT_META[activeStep.eventType] ?? EVENT_META.LINE : EVENT_META.LINE;
  const isAutoPlaying = isPlaying && currentStepIndex < steps.length - 1;

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
          <div>
            <p className="text-sm font-bold text-slate-900">실행 흐름</p>
            <p className="text-[11px] text-slate-500">
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
            <div className="space-y-2">
              {visualState.variables.map((variable) => (
                <VariableCard
                  key={variable.name}
                  variable={variable}
                  active={visualState.activeVariable?.name === variable.name}
                />
              ))}
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
            <span className="text-[10px] text-slate-400">{visualState.outputs.length}</span>
          </div>
          {visualState.outputs.length ? (
            <div className="space-y-2">
              {visualState.outputs.map((output) => (
                <div
                  key={`${output.stepOrder}-${output.lineNumber}`}
                  className={`rounded-md border p-2 transition ${
                    visualState.activeOutput?.stepOrder === output.stepOrder
                      ? 'border-emerald-300 bg-emerald-50 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-slate-950'
                  }`}
                >
                  <pre
                    className={`whitespace-pre-wrap font-mono text-xs ${
                      visualState.activeOutput?.stepOrder === output.stepOrder ? 'text-emerald-900' : 'text-emerald-200'
                    }`}
                  >
                    {output.value}
                  </pre>
                  <div
                    className={`mt-1 text-[10px] ${
                      visualState.activeOutput?.stepOrder === output.stepOrder ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {output.source}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-5 text-center text-xs text-slate-400">
              아직 출력이 없습니다.
            </div>
          )}
        </section>

        <section className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
          <p className="mb-2 text-xs font-bold text-slate-900">타임라인</p>
          <div className="space-y-1.5">
            {steps.map((step, index) => {
              const meta = EVENT_META[step.eventType] ?? EVENT_META.LINE;
              const isActive = index === currentStepIndex;
              const isPast = index < currentStepIndex;

              return (
                <button
                  key={step.stepOrder}
                  type="button"
                  onClick={() => moveStep(index)}
                  className={`flex w-full items-center gap-2 rounded-md border px-2 py-2 text-left transition ${
                    isActive
                      ? `${meta.activeClass} shadow-sm`
                      : isPast
                        ? 'border-slate-200 bg-slate-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded ring-1 ${
                      isActive ? meta.badgeClass : isPast ? 'bg-slate-200 text-slate-600 ring-slate-200' : 'bg-white text-slate-400 ring-slate-200'
                    }`}
                  >
                    {createElement(meta.Icon, { className: 'h-3.5 w-3.5' })}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold text-slate-700">{meta.label}</span>
                      <span className="text-[10px] text-slate-400">line {step.lineNumber}</span>
                    </div>
                    <p className="truncate font-mono text-[11px] text-slate-500">{step.sourceLine}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
