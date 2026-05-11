'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import { CodeEditor } from '@/features/functional-template/components/CodeEditor';
import type {
  PracticeFile,
  PracticeFilePayload,
  PracticeMission,
  PracticeMissionPayload,
  PracticeMissionType,
  TemplatePractice,
} from '@/types/AdminTypes';
import { AdminCard, AdminEmpty, AdminError, AdminPageTitle } from './AdminShell';

const missionTypes: PracticeMissionType[] = ['CONCEPT', 'IMPLEMENTATION', 'DEBUGGING', 'TEST', 'REVIEW'];

const emptyFile: PracticeFilePayload = {
  filePath: '',
  language: 'typescript',
  content: '',
  readOnly: false,
  orderIndex: 0,
};

const emptyMission: PracticeMissionPayload = {
  title: '',
  description: '',
  missionType: 'IMPLEMENTATION',
  validationJson: {},
  orderIndex: 0,
};

type FileGroup = {
  folderPath: string;
  files: PracticeFile[];
};

function buildNormalizedPractice(response: TemplatePractice | null, templateId: number): TemplatePractice {
  return {
    templateId,
    files: response?.files ?? [],
    missions: response?.missions ?? [],
  };
}

function buildNormalizedPath(value: string) {
  return value
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/{2,}/g, '/');
}

function buildFolderKeepPath(folderPath: string) {
  const normalizedFolder = buildNormalizedPath(folderPath);

  return normalizedFolder ? `${normalizedFolder}/.gitkeep` : '.gitkeep';
}

function findLanguageByPath(filePath: string) {
  const extension = filePath.split('.').pop()?.toLowerCase();

  if (extension === 'ts' || extension === 'tsx') return 'typescript';
  if (extension === 'js' || extension === 'jsx') return 'javascript';
  if (extension === 'java') return 'java';
  if (extension === 'py') return 'python';
  if (extension === 'json') return 'json';
  if (extension === 'md') return 'markdown';
  if (extension === 'css') return 'css';
  if (extension === 'html') return 'html';

  return 'text';
}

function parseBulkFilePaths(folderPath: string, bulkText: string) {
  const normalizedFolder = buildNormalizedPath(folderPath);
  const filePaths = bulkText
    .split(/\r?\n|,/g)
    .map((value) => buildNormalizedPath(value))
    .filter(Boolean)
    .map((value) => (normalizedFolder && !value.startsWith(`${normalizedFolder}/`) ? `${normalizedFolder}/${value}` : value));

  if (!filePaths.length && normalizedFolder) {
    return [buildFolderKeepPath(normalizedFolder)];
  }

  return Array.from(new Set(filePaths));
}

function buildFileGroups(files: PracticeFile[]): FileGroup[] {
  const groups = new Map<string, PracticeFile[]>();

  files
    .slice()
    .sort((left, right) => left.orderIndex - right.orderIndex || left.filePath.localeCompare(right.filePath))
    .forEach((file) => {
      const normalizedPath = buildNormalizedPath(file.filePath);
      const slashIndex = normalizedPath.lastIndexOf('/');
      const folderPath = slashIndex >= 0 ? normalizedPath.slice(0, slashIndex) : '(root)';
      const groupFiles = groups.get(folderPath) ?? [];

      groupFiles.push(file);
      groups.set(folderPath, groupFiles);
    });

  return Array.from(groups.entries()).map(([folderPath, groupFiles]) => ({
    folderPath,
    files: groupFiles,
  }));
}

function buildNextOrderIndex(items: Array<{ orderIndex: number }>) {
  return items.reduce((maxOrderIndex, item) => Math.max(maxOrderIndex, item.orderIndex), -1) + 1;
}

export function AdminTemplatePracticePage({ templateId }: { templateId: number }) {
  const [practice, setPractice] = useState<TemplatePractice>(() => buildNormalizedPractice(null, templateId));
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [fileForm, setFileForm] = useState<PracticeFilePayload>(emptyFile);
  const [missionForm, setMissionForm] = useState<PracticeMissionPayload>(emptyMission);
  const [folderPath, setFolderPath] = useState('');
  const [bulkFilePaths, setBulkFilePaths] = useState('');
  const [validationText, setValidationText] = useState('{}');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const selectedFile = useMemo(
    () => practice.files.find((file) => file.id === selectedFileId) ?? null,
    [practice.files, selectedFileId],
  );
  const selectedMission = useMemo(
    () => practice.missions.find((mission) => mission.id === selectedMissionId) ?? null,
    [practice.missions, selectedMissionId],
  );
  const fileGroups = useMemo(() => buildFileGroups(practice.files), [practice.files]);
  const fileTabs = useMemo(() => practice.files.map((file) => file.filePath), [practice.files]);

  const loadPractice = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setPractice(buildNormalizedPractice(await adminService.getTemplatePractice(templateId), templateId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : '실습 정보를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    queueMicrotask(() => void loadPractice());
  }, [loadPractice]);

  const selectFile = (file: PracticeFile) => {
    setSelectedFileId(file.id);
    setFileForm({
      filePath: file.filePath,
      language: file.language,
      content: file.content,
      readOnly: file.readOnly,
      orderIndex: file.orderIndex,
    });
  };

  const handleFileTabSelect = (filePath: string) => {
    const file = practice.files.find((practiceFile) => practiceFile.filePath === filePath);

    if (file) {
      selectFile(file);
    }
  };

  const resetFileForm = () => {
    setSelectedFileId(null);
    setFileForm({
      ...emptyFile,
      orderIndex: buildNextOrderIndex(practice.files),
    });
  };

  const selectMission = (mission: PracticeMission) => {
    setSelectedMissionId(mission.id);
    setMissionForm({
      title: mission.title,
      description: mission.description ?? '',
      missionType: mission.missionType ?? mission.type ?? 'IMPLEMENTATION',
      validationJson: mission.validationJson ?? {},
      orderIndex: mission.orderIndex,
    });
    setValidationText(JSON.stringify(mission.validationJson ?? {}, null, 2));
  };

  const resetMissionForm = () => {
    setSelectedMissionId(null);
    setMissionForm({
      ...emptyMission,
      orderIndex: buildNextOrderIndex(practice.missions),
    });
    setValidationText('{}');
  };

  const saveFile = async () => {
    setError('');
    setMessage('');

    try {
      const payload = {
        ...fileForm,
        filePath: buildNormalizedPath(fileForm.filePath),
      };

      if (!payload.filePath) {
        throw new Error('파일 경로를 입력해주세요.');
      }

      if (selectedFileId) {
        await adminService.updatePracticeFile(templateId, selectedFileId, payload);
      } else {
        await adminService.createPracticeFile(templateId, payload);
      }

      resetFileForm();
      setMessage('실습 파일을 저장했습니다.');
      await loadPractice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '실습 파일 저장에 실패했습니다.');
    }
  };

  const createBulkFiles = async () => {
    setIsBulkSaving(true);
    setError('');
    setMessage('');

    try {
      const paths = parseBulkFilePaths(folderPath, bulkFilePaths);

      if (!paths.length) {
        throw new Error('추가할 폴더 또는 파일 경로를 입력해주세요.');
      }

      const startOrderIndex = buildNextOrderIndex(practice.files);

      for (const [index, filePath] of paths.entries()) {
        await adminService.createPracticeFile(templateId, {
          filePath,
          language: findLanguageByPath(filePath),
          content: '',
          readOnly: filePath.endsWith('/.gitkeep'),
          orderIndex: startOrderIndex + index,
        });
      }

      setBulkFilePaths('');
      setMessage(`${paths.length}개의 폴더/파일 항목을 추가했습니다.`);
      await loadPractice();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : '폴더/파일 일괄 추가에 실패했습니다.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const deleteFile = async () => {
    if (!selectedFileId || !confirm('선택한 파일을 삭제할까요?')) {
      return;
    }

    try {
      await adminService.deletePracticeFile(templateId, selectedFileId);
      resetFileForm();
      setMessage('실습 파일을 삭제했습니다.');
      await loadPractice();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '실습 파일 삭제에 실패했습니다.');
    }
  };

  const saveMission = async () => {
    setError('');
    setMessage('');

    try {
      const validationJson = JSON.parse(validationText) as Record<string, unknown>;
      const payload = {
        ...missionForm,
        validationJson,
      };

      if (!payload.title) {
        throw new Error('미션명을 입력해주세요.');
      }

      if (selectedMissionId) {
        await adminService.updatePracticeMission(templateId, selectedMissionId, payload);
      } else {
        await adminService.createPracticeMission(templateId, payload);
      }

      resetMissionForm();
      setMessage('미션과 문제를 저장했습니다.');
      await loadPractice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '미션 저장에 실패했습니다.');
    }
  };

  const deleteMission = async () => {
    if (!selectedMissionId || !confirm('선택한 미션을 삭제할까요?')) {
      return;
    }

    try {
      await adminService.deletePracticeMission(templateId, selectedMissionId);
      resetMissionForm();
      setMessage('미션을 삭제했습니다.');
      await loadPractice();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '미션 삭제에 실패했습니다.');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/templates" className="text-sm font-semibold text-emerald-700">
          기능 템플릿 목록으로
        </Link>
      </div>
      <AdminPageTitle
        title={`기능 템플릿 실습 관리 #${templateId}`}
        description="사용자 실습 환경의 초기 폴더, 파일, 미션, 문제를 관리합니다."
      />
      <AdminError message={error} />
      {message && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {isLoading && <AdminCard className="mb-4 text-sm text-slate-500">실습 정보를 불러오는 중입니다.</AdminCard>}

      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5">
          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">폴더/파일 구조</h3>
              <button
                type="button"
                onClick={resetFileForm}
                className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
              >
                새 파일
              </button>
            </div>

            {!fileGroups.length ? (
              <AdminEmpty message="등록된 실습 파일이 없습니다." />
            ) : (
              <div className="max-h-[26rem] overflow-y-auto rounded-md border border-slate-200">
                {fileGroups.map((group) => (
                  <div key={group.folderPath} className="border-b border-slate-100 last:border-b-0">
                    <div className="bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">{group.folderPath}</div>
                    <div className="divide-y divide-slate-100">
                      {group.files.map((file) => (
                        <button
                          key={file.id}
                          type="button"
                          onClick={() => selectFile(file)}
                          className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm ${
                            selectedFile?.id === file.id ? 'bg-emerald-50 text-emerald-900' : 'bg-white text-slate-700'
                          }`}
                        >
                          <span>
                            <span className="font-semibold">{file.filePath.split('/').pop()}</span>
                            <span className="ml-2 text-xs text-slate-500">{file.language}</span>
                          </span>
                          <span className="text-xs text-slate-400">order {file.orderIndex}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <h3 className="mb-3 text-lg font-bold">폴더/파일 일괄 추가</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
              <input
                value={folderPath}
                onChange={(event) => setFolderPath(event.target.value)}
                placeholder="src/app"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <textarea
                value={bulkFilePaths}
                onChange={(event) => setBulkFilePaths(event.target.value)}
                placeholder={'page.tsx\ncomponents/Header.tsx\nlib/api.ts'}
                rows={4}
                className="rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => void createBulkFiles()}
              disabled={isBulkSaving}
              className="mt-3 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              폴더/파일 추가
            </button>
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{selectedFileId ? '파일 수정' : '파일 추가'}</h3>
              {selectedFileId && (
                <button
                  type="button"
                  onClick={() => void deleteFile()}
                  className="rounded-md border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={fileForm.filePath}
                onChange={(event) => setFileForm((current) => ({ ...current, filePath: event.target.value }))}
                placeholder="src/app/page.tsx"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={fileForm.language}
                onChange={(event) => setFileForm((current) => ({ ...current, language: event.target.value }))}
                placeholder="typescript"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                type="number"
                value={fileForm.orderIndex}
                onChange={(event) =>
                  setFileForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <label className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm">
                <input
                  type="checkbox"
                  checked={fileForm.readOnly}
                  onChange={(event) => setFileForm((current) => ({ ...current, readOnly: event.target.checked }))}
                />
                읽기 전용
              </label>
              <div className="md:col-span-2 h-[34rem] overflow-hidden rounded-md border border-slate-300">
                <CodeEditor
                  fileName={fileForm.filePath || 'new-file'}
                  code={fileForm.content}
                  onCodeChange={(content) => setFileForm((current) => ({ ...current, content }))}
                  fileTabs={fileTabs}
                  activeFile={fileForm.filePath}
                  onFileSelect={handleFileTabSelect}
                  hasContent
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => void saveFile()}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              파일 저장
            </button>
          </AdminCard>
        </div>

        <div className="space-y-5">
          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">미션 목록</h3>
              <button
                type="button"
                onClick={resetMissionForm}
                className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
              >
                새 미션
              </button>
            </div>

            {!practice.missions.length ? (
              <AdminEmpty message="등록된 미션이 없습니다." />
            ) : (
              <div className="space-y-2">
                {practice.missions
                  .slice()
                  .sort((left, right) => left.orderIndex - right.orderIndex)
                  .map((mission) => (
                    <button
                      key={mission.id}
                      type="button"
                      onClick={() => selectMission(mission)}
                      className={`w-full rounded-md border px-3 py-3 text-left text-sm ${
                        selectedMission?.id === mission.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                      }`}
                    >
                      <span className="block font-semibold">{mission.title}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {mission.missionType ?? mission.type} · order {mission.orderIndex}
                      </span>
                      {mission.description && (
                        <span className="mt-1 line-clamp-2 block text-xs text-slate-400">{mission.description}</span>
                      )}
                    </button>
                  ))}
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">{selectedMissionId ? '미션/문제 수정' : '미션/문제 추가'}</h3>
              {selectedMissionId && (
                <button
                  type="button"
                  onClick={() => void deleteMission()}
                  className="rounded-md border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                >
                  삭제
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={missionForm.title}
                onChange={(event) => setMissionForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="미션명"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <select
                value={missionForm.missionType ?? missionForm.type}
                onChange={(event) =>
                  setMissionForm((current) => ({
                    ...current,
                    missionType: event.target.value as PracticeMissionType,
                  }))
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {missionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={missionForm.orderIndex}
                onChange={(event) =>
                  setMissionForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <textarea
                value={missionForm.description ?? ''}
                onChange={(event) => setMissionForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="사용자에게 보여줄 문제 내용"
                rows={8}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <textarea
                value={validationText}
                onChange={(event) => setValidationText(event.target.value)}
                placeholder="validationJson"
                rows={16}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>

            <button
              type="button"
              onClick={() => void saveMission()}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              미션/문제 저장
            </button>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
