'use client';

import { Plus, Trash2 } from 'lucide-react';
import type { AiFeatureTemplateApiSpec } from '@/api/services/AiService';
import { parseStructuredApiSpec } from '@/features/functional-template/components/ApiSpecSection';

const emptyApi = (): AiFeatureTemplateApiSpec => ({
  apiName: '',
  method: 'GET',
  endpoint: '/',
  description: '',
  authenticationRequired: false,
  requestHeaders: [],
  requestFields: [],
  responseFields: [],
  statusCodes: [],
  errorResponses: [],
  frontendNotes: [],
  requestBody: {},
  responseBody: {},
  status: 200,
});

function formatJson(value: unknown) {
  return JSON.stringify(value ?? [], null, 2);
}

function parseJson(value: string, fallback: unknown) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const inputClass = 'h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#7C3AED]';
const textareaClass = 'w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-xs leading-5 outline-none focus:border-[#7C3AED]';

export function AdminApiSpecEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const structured = parseStructuredApiSpec(value);
  const isLegacy = Boolean(value.trim()) && structured === null;
  const specs = structured ?? [];

  const updateSpecs = (next: AiFeatureTemplateApiSpec[]) => onChange(JSON.stringify(next, null, 2));
  const updateApi = <TKey extends keyof AiFeatureTemplateApiSpec>(
    index: number,
    key: TKey,
    nextValue: AiFeatureTemplateApiSpec[TKey],
  ) => updateSpecs(specs.map((api, apiIndex) => (apiIndex === index ? { ...api, [key]: nextValue } : api)));

  if (isLegacy) {
    return (
      <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-950">API 명세</h4>
            <p className="mt-1 text-xs text-slate-500">기존 텍스트 명세입니다. 그대로 수정하거나 구조화 명세로 전환할 수 있습니다.</p>
          </div>
          <button type="button" onClick={() => updateSpecs([emptyApi()])} className="h-10 rounded-md bg-[#7C3AED] px-4 text-sm font-semibold text-white">
            구조화 명세로 전환
          </button>
        </div>
        <textarea value={value} onChange={(event) => onChange(event.target.value)} rows={10} className={textareaClass} />
      </div>
    );
  }

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-950">API 명세</h4>
          <p className="mt-1 text-xs text-slate-500">상세 필드는 사용자 기능 템플릿 화면에서 표로 표시됩니다.</p>
        </div>
        <button type="button" onClick={() => updateSpecs([...specs, emptyApi()])} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#7C3AED] px-4 text-sm font-semibold text-white">
          <Plus size={16} /> API 추가
        </button>
      </div>

      {specs.length === 0 ? (
        <button type="button" onClick={() => updateSpecs([emptyApi()])} className="flex min-h-28 w-full items-center justify-center rounded-lg border border-dashed border-slate-300 text-sm font-semibold text-slate-500">
          첫 API 명세 추가
        </button>
      ) : (
        <div className="space-y-4">
          {specs.map((api, index) => (
            <article key={`${api.method}-${api.endpoint}-${index}`} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <h5 className="font-bold text-slate-950">API {index + 1}</h5>
                <button type="button" onClick={() => updateSpecs(specs.filter((_, apiIndex) => apiIndex !== index))} title="API 삭제" className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-rose-200 text-rose-600">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <input value={api.apiName} onChange={(event) => updateApi(index, 'apiName', event.target.value)} placeholder="API 이름" className={inputClass} />
                <select value={api.method} onChange={(event) => updateApi(index, 'method', event.target.value)} className={inputClass}>
                  {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => <option key={method}>{method}</option>)}
                </select>
                <input value={api.endpoint} onChange={(event) => updateApi(index, 'endpoint', event.target.value)} placeholder="/api/v1/..." className={`${inputClass} lg:col-span-2`} />
              </div>

              <textarea value={api.description} onChange={(event) => updateApi(index, 'description', event.target.value)} rows={2} placeholder="API 설명" className={textareaClass} />
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={Boolean(api.authenticationRequired)} onChange={(event) => updateApi(index, 'authenticationRequired', event.target.checked)} />
                인증 필요
              </label>

              <div className="grid gap-3 lg:grid-cols-2">
                {([
                  ['requestHeaders', 'Request Headers JSON'],
                  ['requestFields', 'Request Fields JSON'],
                  ['responseFields', 'Response Fields JSON'],
                  ['statusCodes', 'Status Codes JSON'],
                  ['errorResponses', 'Error Responses JSON'],
                ] as const).map(([key, label]) => (
                  <label key={key} className="text-xs font-semibold text-slate-600">
                    {label}
                    <textarea defaultValue={formatJson(api[key])} onBlur={(event) => updateApi(index, key, parseJson(event.target.value, api[key]) as AiFeatureTemplateApiSpec[typeof key])} rows={6} className={`mt-1 ${textareaClass}`} />
                  </label>
                ))}
                <label className="text-xs font-semibold text-slate-600">
                  Frontend Notes (한 줄씩)
                  <textarea value={(api.frontendNotes ?? []).join('\n')} onChange={(event) => updateApi(index, 'frontendNotes', event.target.value.split(/\r?\n/).filter(Boolean))} rows={6} className={`mt-1 ${textareaClass}`} />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Request Body JSON
                  <textarea defaultValue={formatJson(api.requestBody)} onBlur={(event) => updateApi(index, 'requestBody', parseJson(event.target.value, event.target.value))} rows={7} className={`mt-1 ${textareaClass}`} />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Response Body JSON
                  <textarea defaultValue={formatJson(api.responseBody)} onBlur={(event) => updateApi(index, 'responseBody', parseJson(event.target.value, event.target.value))} rows={7} className={`mt-1 ${textareaClass}`} />
                </label>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
