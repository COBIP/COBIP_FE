'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
import { CodeEditor } from '@/features/functional-template/components/CodeEditor';
import { SourceCodeSection } from '@/features/functional-template/components/SourceCodeSection';
import type {
  PracticeFile,
  PracticeFilePayload,
  PracticeMission,
  PracticeMissionPayload,
  PracticeMissionType,
  TemplatePractice,
} from '@/types/AdminTypes';
import { AdminCard, AdminEmpty, AdminError, AdminPageTitle } from './AdminShell';

const missionTypes: PracticeMissionType[] = ['CONCEPT', 'IMPLEMENTATION', 'REVIEW'];
const problemTypes: PracticeMissionType[] = ['DEBUGGING', 'TEST'];

const emptyFile: PracticeFilePayload = {
  filePath: '',
  language: 'java',
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

const emptyProblem: PracticeMissionPayload = {
  title: '',
  description: '',
  missionType: 'TEST',
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

  return Array.from(
    new Set(
      bulkText
        .split(/\r?\n|,/g)
        .map((value) => buildNormalizedPath(value))
        .filter(Boolean)
        .map((value) =>
          normalizedFolder && !value.startsWith(`${normalizedFolder}/`) ? `${normalizedFolder}/${value}` : value,
        ),
    ),
  );
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

  return Array.from(groups.entries()).map(([folderPath, filesInFolder]) => ({
    folderPath,
    files: filesInFolder,
  }));
}

function buildNextOrderIndex(items: Array<{ orderIndex: number }>) {
  return items.reduce((maxOrderIndex, item) => Math.max(maxOrderIndex, item.orderIndex), -1) + 1;
}

function checkProblemMissionType(missionType?: PracticeMissionType) {
  return missionType === 'DEBUGGING' || missionType === 'TEST';
}

function buildMissionPayload(form: PracticeMissionPayload, validationText: string) {
  const missionType = form.missionType ?? form.type;

  return {
    ...form,
    type: missionType,
    missionType,
    validationJson: JSON.parse(validationText) as Record<string, unknown>,
  };
}

function parseValidationJsonText(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as Record<string, unknown> : {};
  } catch {
    return {};
  }
}

function getValidationTargetFilePath(value: string) {
  const validationJson = parseValidationJsonText(value);
  const filePath =
    validationJson.filePath ??
    validationJson.targetFilePath ??
    validationJson.targetFile ??
    validationJson.mainFile ??
    validationJson.entryFile;

  return typeof filePath === 'string' ? filePath : '';
}

function buildValidationTextWithFilePath(value: string, filePath: string) {
  const validationJson = parseValidationJsonText(value);
  const nextFilePath = filePath.trim();

  if (nextFilePath) {
    validationJson.filePath = nextFilePath;
  } else {
    delete validationJson.filePath;
  }

  return JSON.stringify(validationJson, null, 2);
}

function getValidationStringField(value: string, key: string) {
  const fieldValue = parseValidationJsonText(value)[key];
  return typeof fieldValue === 'string' ? fieldValue : '';
}

function buildValidationTextWithField(value: string, key: string, fieldValue: string) {
  const validationJson = parseValidationJsonText(value);
  const nextValue = fieldValue.trim();

  if (nextValue) {
    if (key === 'timeLimitMillis' || key === 'memoryLimitMb') {
      const numericValue = Number(nextValue);
      if (Number.isFinite(numericValue) && numericValue > 0) {
        validationJson[key] = numericValue;
      }
    } else {
      validationJson[key] = nextValue;
    }
  } else {
    delete validationJson[key];
  }

  return JSON.stringify(validationJson, null, 2);
}

function buildValidationTextWithProjectDefaults(value: string) {
  const validationJson = parseValidationJsonText(value);

  validationJson.dockerImage = getValidationStringField(value, 'dockerImage') || 'gradle:8.14-jdk21';
  validationJson.testCommand = getValidationStringField(value, 'testCommand') || 'gradle test --no-daemon';
  validationJson.timeLimitMillis = Number(getValidationStringField(value, 'timeLimitMillis')) || 120000;
  validationJson.memoryLimitMb = Number(getValidationStringField(value, 'memoryLimitMb')) || 512;
  delete validationJson.testCases;
  delete validationJson.expectedOutput;

  return JSON.stringify(validationJson, null, 2);
}

export function AdminTemplatePracticePage({ templateId }: { templateId: number }) {
  const [practice, setPractice] = useState<TemplatePractice>(() => buildNormalizedPractice(null, templateId));
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [selectedProblemId, setSelectedProblemId] = useState<number | null>(null);
  const [fileForm, setFileForm] = useState<PracticeFilePayload>(emptyFile);
  const [missionForm, setMissionForm] = useState<PracticeMissionPayload>(emptyMission);
  const [problemForm, setProblemForm] = useState<PracticeMissionPayload>(emptyProblem);
  const [folderPath, setFolderPath] = useState('');
  const [bulkFilePaths, setBulkFilePaths] = useState('');
  const [validationText, setValidationText] = useState('{}');
  const [problemValidationText, setProblemValidationText] = useState('{}');
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
  const selectedProblem = useMemo(
    () => practice.missions.find((mission) => mission.id === selectedProblemId) ?? null,
    [practice.missions, selectedProblemId],
  );
  const fileGroups = useMemo(() => buildFileGroups(practice.files), [practice.files]);
  const fileTabs = useMemo(() => practice.files.map((file) => file.filePath), [practice.files]);
  const missionItems = useMemo(
    () => practice.missions.filter((mission) => !checkProblemMissionType(mission.missionType ?? mission.type)),
    [practice.missions],
  );
  const problemItems = useMemo(
    () => practice.missions.filter((mission) => checkProblemMissionType(mission.missionType ?? mission.type)),
    [practice.missions],
  );

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

    if (file) selectFile(file);
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

  const selectProblem = (problem: PracticeMission) => {
    setSelectedProblemId(problem.id);
    setProblemForm({
      title: problem.title,
      description: problem.description ?? '',
      missionType: problem.missionType ?? problem.type ?? 'TEST',
      validationJson: problem.validationJson ?? {},
      orderIndex: problem.orderIndex,
    });
    setProblemValidationText(JSON.stringify(problem.validationJson ?? {}, null, 2));
  };

  const resetMissionForm = () => {
    setSelectedMissionId(null);
    setMissionForm({
      ...emptyMission,
      orderIndex: buildNextOrderIndex(practice.missions),
    });
    setValidationText('{}');
  };

  const resetProblemForm = () => {
    setSelectedProblemId(null);
    setProblemForm({
      ...emptyProblem,
      orderIndex: buildNextOrderIndex(practice.missions),
    });
    setProblemValidationText('{}');
  };

  const saveFile = async () => {
    setError('');
    setMessage('');

    try {
      const payload = {
        ...fileForm,
        filePath: buildNormalizedPath(fileForm.filePath),
      };

      if (!payload.filePath) throw new Error('파일 경로를 입력해주세요.');

      if (selectedFileId) await adminService.updatePracticeFile(templateId, selectedFileId, payload);
      else await adminService.createPracticeFile(templateId, payload);

      resetFileForm();
      setMessage('코드 파일을 저장했습니다.');
      await loadPractice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '코드 파일 저장에 실패했습니다.');
    }
  };

  const createBulkFiles = async () => {
    setIsBulkSaving(true);
    setError('');
    setMessage('');

    try {
      const paths = parseBulkFilePaths(folderPath, bulkFilePaths);

      if (!paths.length) throw new Error('추가할 파일 경로를 입력해주세요.');

      const startOrderIndex = buildNextOrderIndex(practice.files);

      for (const [index, filePath] of paths.entries()) {
        await adminService.createPracticeFile(templateId, {
          filePath,
          language: findLanguageByPath(filePath),
          content: '',
          readOnly: false,
          orderIndex: startOrderIndex + index,
        });
      }

      setBulkFilePaths('');
      setMessage(`${paths.length}개의 파일을 추가했습니다. 각 파일을 선택해서 코드를 입력해주세요.`);
      await loadPractice();
    } catch (bulkError) {
      setError(bulkError instanceof Error ? bulkError.message : '파일 일괄 추가에 실패했습니다.');
    } finally {
      setIsBulkSaving(false);
    }
  };

  const deleteFile = async () => {
    if (!selectedFileId || !confirm('선택한 파일을 삭제할까요?')) return;

    try {
      await adminService.deletePracticeFile(templateId, selectedFileId);
      resetFileForm();
      setMessage('코드 파일을 삭제했습니다.');
      await loadPractice();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '코드 파일 삭제에 실패했습니다.');
    }
  };

  const saveMission = async () => {
    setError('');
    setMessage('');

    try {
      const payload = buildMissionPayload(missionForm, validationText);

      if (!payload.title) throw new Error('미션명을 입력해주세요.');
      if (!payload.description) throw new Error('미션 설명을 입력해주세요.');
      if (!payload.missionType || checkProblemMissionType(payload.missionType)) {
        throw new Error('미션 타입은 CONCEPT, IMPLEMENTATION, REVIEW 중 하나여야 합니다.');
      }

      if (selectedMissionId) await adminService.updatePracticeMission(templateId, selectedMissionId, payload);
      else await adminService.createPracticeMission(templateId, payload);

      resetMissionForm();
      setMessage('미션을 저장했습니다.');
      await loadPractice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '미션 저장에 실패했습니다.');
    }
  };

  const saveProblem = async () => {
    setError('');
    setMessage('');

    try {
      const payload = buildMissionPayload(problemForm, problemValidationText);

      if (!payload.title) throw new Error('문제명을 입력해주세요.');
      if (!payload.description) throw new Error('문제 설명을 입력해주세요.');
      if (!payload.missionType || !checkProblemMissionType(payload.missionType)) {
        throw new Error('문제 타입은 DEBUGGING, TEST 중 하나여야 합니다.');
      }

      if (selectedProblemId) await adminService.updatePracticeMission(templateId, selectedProblemId, payload);
      else await adminService.createPracticeMission(templateId, payload);

      resetProblemForm();
      setMessage('문제를 저장했습니다.');
      await loadPractice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '문제 저장에 실패했습니다.');
    }
  };

  const deleteMission = async () => {
    if (!selectedMissionId || !confirm('선택한 미션을 삭제할까요?')) return;

    try {
      await adminService.deletePracticeMission(templateId, selectedMissionId);
      resetMissionForm();
      setMessage('미션을 삭제했습니다.');
      await loadPractice();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '미션 삭제에 실패했습니다.');
    }
  };

  const deleteProblem = async () => {
    if (!selectedProblemId || !confirm('선택한 문제를 삭제할까요?')) return;

    try {
      await adminService.deletePracticeMission(templateId, selectedProblemId);
      resetProblemForm();
      setMessage('문제를 삭제했습니다.');
      await loadPractice();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : '문제 삭제에 실패했습니다.');
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
        description="사용자 실습 화면의 전체 코드, 폴더/파일, 미션, 문제를 관리합니다."
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
            <div className="mb-4">
              <h3 className="text-lg font-bold">전체 코드 미리보기</h3>
              <p className="text-sm text-slate-500">사용자 화면의 전체 코드 탭과 코드 실행기에 표시될 파일 목록입니다.</p>
            </div>
            {practice.files.length > 0 ? (
              <SourceCodeSection
                files={practice.files}
                isDarkMode={false}
                onOpenEditor={(filePath) => {
                  const file = practice.files.find((practiceFile) => practiceFile.filePath === filePath);
                  if (file) selectFile(file);
                }}
              />
            ) : (
              <AdminEmpty message="등록된 코드 파일이 없습니다." />
            )}
          </AdminCard>

          <AdminCard>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-emerald-950">파일 빠른 추가</h3>
                  <p className="mt-1 text-sm text-emerald-800">
                    폴더 경로와 파일명을 넣으면 빈 파일이 생성됩니다. 생성 후 아래 코드 편집 영역에서 내용을 입력하세요.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetFileForm}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white"
                >
                  새 파일
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-[12rem_minmax(0,1fr)]">
                <input
                  value={folderPath}
                  onChange={(event) => setFolderPath(event.target.value)}
                  placeholder="src/main/java"
                  className="h-10 rounded-md border border-emerald-200 bg-white px-3 text-sm"
                />
                <textarea
                  value={bulkFilePaths}
                  onChange={(event) => setBulkFilePaths(event.target.value)}
                  placeholder={'AuthController.java\nAuthService.java\nJwtTokenProvider.java'}
                  rows={4}
                  className="rounded-md border border-emerald-200 bg-white px-3 py-2 font-mono text-sm"
                />
              </div>

              <button
                type="button"
                onClick={() => void createBulkFiles()}
                disabled={isBulkSaving}
                className="mt-4 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                파일 추가
              </button>
            </div>
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">폴더/파일 구조</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {practice.files.length} files
              </span>
            </div>
            {!fileGroups.length ? (
              <AdminEmpty message="등록된 코드 파일이 없습니다." />
            ) : (
              <div className="max-h-104 overflow-y-auto rounded-md border border-slate-200">
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
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">코드 편집</h3>
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
                placeholder="src/main/java/AuthController.java"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <input
                value={fileForm.language}
                onChange={(event) => setFileForm((current) => ({ ...current, language: event.target.value }))}
                placeholder="java"
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
              <div className="md:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">코드 내용</span>
                  <span className="text-xs text-slate-500">빈 파일도 바로 입력할 수 있습니다.</span>
                </div>
                <div className="h-[34rem] overflow-hidden rounded-md border border-slate-300">
                  <CodeEditor
                    fileName={fileForm.filePath || 'new-file'}
                    code={fileForm.content}
                    onCodeChange={(content) => setFileForm((current) => ({ ...current, content }))}
                    fileTabs={fileTabs}
                    activeFile={fileForm.filePath}
                    onFileSelect={handleFileTabSelect}
                    hasContent
                    showRunner={false}
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void saveFile()}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              코드 저장
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
            {!missionItems.length ? (
              <AdminEmpty message="등록된 미션이 없습니다." />
            ) : (
              <div className="space-y-2">
                {missionItems.map((mission) => (
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
                    {mission.description && <span className="mt-1 line-clamp-2 block text-xs text-slate-400">{mission.description}</span>}
                  </button>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">미션 추가 / 수정</h3>
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
                  setMissionForm((current) => ({ ...current, missionType: event.target.value as PracticeMissionType }))
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {missionTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
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
                placeholder="사용자에게 보여줄 미션 설명"
                rows={8}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={getValidationTargetFilePath(validationText)}
                onChange={(event) => setValidationText((current) => buildValidationTextWithFilePath(current, event.target.value))}
                placeholder="연결 파일 경로 예: src/main/java/com/cobip/auth/service/AuthService.java"
                className="md:col-span-2 h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <div className="md:col-span-2 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-950">프로젝트 채점 설정</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Spring 프로젝트 미션은 Gradle 테스트 명령으로 채점하세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValidationText((current) => buildValidationTextWithProjectDefaults(current))}
                    className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
                  >
                    프로젝트 채점 기본값
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={getValidationStringField(validationText, 'dockerImage')}
                    onChange={(event) => setValidationText((current) => buildValidationTextWithField(current, 'dockerImage', event.target.value))}
                    placeholder="dockerImage 예: gradle:8.14-jdk21"
                    className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                  />
                  <input
                    value={getValidationStringField(validationText, 'testCommand')}
                    onChange={(event) => setValidationText((current) => buildValidationTextWithField(current, 'testCommand', event.target.value))}
                    placeholder="testCommand 예: gradle test --no-daemon"
                    className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  value={getValidationStringField(validationText, 'timeLimitMillis')}
                  onChange={(event) => setValidationText((current) => buildValidationTextWithField(current, 'timeLimitMillis', event.target.value))}
                  placeholder="timeLimitMillis: 120000"
                  className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                />
                <input
                  value={getValidationStringField(validationText, 'memoryLimitMb')}
                  onChange={(event) => setValidationText((current) => buildValidationTextWithField(current, 'memoryLimitMb', event.target.value))}
                  placeholder="memoryLimitMb: 512"
                  className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                />
              </div>
              <textarea
                value={validationText}
                onChange={(event) => setValidationText(event.target.value)}
                placeholder="validationJson"
                rows={12}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => void saveMission()}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              미션 저장
            </button>
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">문제 목록</h3>
              <button
                type="button"
                onClick={resetProblemForm}
                className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
              >
                새 문제
              </button>
            </div>
            {!problemItems.length ? (
              <AdminEmpty message="등록된 문제가 없습니다." />
            ) : (
              <div className="space-y-2">
                {problemItems.map((problem) => (
                  <button
                    key={problem.id}
                    type="button"
                    onClick={() => selectProblem(problem)}
                    className={`w-full rounded-md border px-3 py-3 text-left text-sm ${
                      selectedProblem?.id === problem.id ? 'border-rose-500 bg-rose-50' : 'border-slate-200'
                    }`}
                  >
                    <span className="block font-semibold">{problem.title}</span>
                    <span className="mt-1 block text-xs text-slate-500">
                      {problem.missionType ?? problem.type} · order {problem.orderIndex}
                    </span>
                    {problem.description && <span className="mt-1 line-clamp-2 block text-xs text-slate-400">{problem.description}</span>}
                  </button>
                ))}
              </div>
            )}
          </AdminCard>

          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">문제 추가 / 수정</h3>
              {selectedProblemId && (
                <button
                  type="button"
                  onClick={() => void deleteProblem()}
                  className="rounded-md border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-700"
                >
                  삭제
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <input
                value={problemForm.title}
                onChange={(event) => setProblemForm((current) => ({ ...current, title: event.target.value }))}
                placeholder="문제명"
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <select
                value={problemForm.missionType ?? problemForm.type}
                onChange={(event) =>
                  setProblemForm((current) => ({ ...current, missionType: event.target.value as PracticeMissionType }))
                }
                className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm"
              >
                {problemTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                type="number"
                value={problemForm.orderIndex}
                onChange={(event) =>
                  setProblemForm((current) => ({ ...current, orderIndex: Number(event.target.value) }))
                }
                className="h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <textarea
                value={problemForm.description ?? ''}
                onChange={(event) => setProblemForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="사용자에게 보여줄 문제 설명"
                rows={8}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={getValidationTargetFilePath(problemValidationText)}
                onChange={(event) => setProblemValidationText((current) => buildValidationTextWithFilePath(current, event.target.value))}
                placeholder="연결 파일 경로 예: src/main/java/com/cobip/auth/controller/AuthController.java"
                className="md:col-span-2 h-10 rounded-md border border-slate-300 px-3 text-sm"
              />
              <div className="md:col-span-2 rounded-md border border-emerald-100 bg-emerald-50 p-3 text-sm text-slate-700">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-950">프로젝트 채점 설정</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Spring 파일을 수정하는 문제는 Gradle 테스트 명령으로 채점하세요.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProblemValidationText((current) => buildValidationTextWithProjectDefaults(current))}
                    className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700"
                  >
                    프로젝트 채점 기본값
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={getValidationStringField(problemValidationText, 'dockerImage')}
                    onChange={(event) => setProblemValidationText((current) => buildValidationTextWithField(current, 'dockerImage', event.target.value))}
                    placeholder="dockerImage 예: gradle:8.14-jdk21"
                    className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                  />
                  <input
                    value={getValidationStringField(problemValidationText, 'testCommand')}
                    onChange={(event) => setProblemValidationText((current) => buildValidationTextWithField(current, 'testCommand', event.target.value))}
                    placeholder="testCommand 예: gradle test --no-daemon"
                    className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2 grid grid-cols-1 gap-2 md:grid-cols-2">
                <input
                  value={getValidationStringField(problemValidationText, 'timeLimitMillis')}
                  onChange={(event) => setProblemValidationText((current) => buildValidationTextWithField(current, 'timeLimitMillis', event.target.value))}
                  placeholder="timeLimitMillis: 120000"
                  className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                />
                <input
                  value={getValidationStringField(problemValidationText, 'memoryLimitMb')}
                  onChange={(event) => setProblemValidationText((current) => buildValidationTextWithField(current, 'memoryLimitMb', event.target.value))}
                  placeholder="memoryLimitMb: 512"
                  className="h-10 rounded-md border border-emerald-200 px-3 text-sm"
                />
              </div>
              <textarea
                value={problemValidationText}
                onChange={(event) => setProblemValidationText(event.target.value)}
                placeholder="validationJson"
                rows={12}
                className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => void saveProblem()}
              className="mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              문제 저장
            </button>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
