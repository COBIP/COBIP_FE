'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminService } from '@/api/services/AdminService';
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

function buildNormalizedPractice(response: TemplatePractice | null, templateId: number): TemplatePractice {
  return {
    templateId,
    files: response?.files ?? [],
    missions: response?.missions ?? [],
  };
}

export function AdminTemplatePracticePage({ templateId }: { templateId: number }) {
  const [practice, setPractice] = useState<TemplatePractice>(() => buildNormalizedPractice(null, templateId));
  const [selectedFileId, setSelectedFileId] = useState<number | null>(null);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null);
  const [fileForm, setFileForm] = useState<PracticeFilePayload>(emptyFile);
  const [missionForm, setMissionForm] = useState<PracticeMissionPayload>(emptyMission);
  const [validationText, setValidationText] = useState('{}');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const selectedFile = useMemo(
    () => practice.files.find((file) => file.id === selectedFileId) ?? null,
    [practice.files, selectedFileId],
  );
  const selectedMission = useMemo(
    () => practice.missions.find((mission) => mission.id === selectedMissionId) ?? null,
    [practice.missions, selectedMissionId],
  );

  const loadPractice = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      setPractice(buildNormalizedPractice(await adminService.getTemplatePractice(templateId), templateId));
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : '실습 정보를 불러오지 못했습니다. Swagger에 없는 API라 경로를 확인해야 할 수 있습니다.',
      );
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

  const saveFile = async () => {
    setError('');
    setMessage('');

    try {
      if (selectedFileId) {
        await adminService.updatePracticeFile(templateId, selectedFileId, fileForm);
      } else {
        await adminService.createPracticeFile(templateId, fileForm);
      }

      setSelectedFileId(null);
      setFileForm(emptyFile);
      setMessage('실습 파일을 저장했습니다.');
      await loadPractice();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : '실습 파일 저장에 실패했습니다.');
    }
  };

  const deleteFile = async () => {
    if (!selectedFileId || !confirm('선택한 파일을 삭제할까요?')) {
      return;
    }

    try {
      await adminService.deletePracticeFile(templateId, selectedFileId);
      setSelectedFileId(null);
      setFileForm(emptyFile);
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

      if (selectedMissionId) {
        await adminService.updatePracticeMission(templateId, selectedMissionId, payload);
      } else {
        await adminService.createPracticeMission(templateId, payload);
      }

      setSelectedMissionId(null);
      setMissionForm(emptyMission);
      setValidationText('{}');
      setMessage('미션을 저장했습니다.');
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
      setSelectedMissionId(null);
      setMissionForm(emptyMission);
      setValidationText('{}');
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
      <AdminPageTitle title={`기능 템플릿 실습 관리 #${templateId}`} description="실습 파일과 미션을 관리합니다." />
      <AdminError message={error} />
      {message && (
        <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      {isLoading && <AdminCard className="mb-4 text-sm text-slate-500">실습 정보를 불러오는 중입니다.</AdminCard>}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <AdminCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">파일</h3>
            <button
              type="button"
              onClick={() => {
                setSelectedFileId(null);
                setFileForm(emptyFile);
              }}
              className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
            >
              새 파일
            </button>
          </div>

          {!practice.files.length ? (
            <AdminEmpty message="등록된 실습 파일이 없습니다." />
          ) : (
            <div className="mb-4 space-y-2">
              {practice.files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  onClick={() => selectFile(file)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selectedFile?.id === file.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  <span className="font-semibold">{file.filePath}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {file.language} · order {file.orderIndex}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={fileForm.filePath}
              onChange={(event) => setFileForm((current) => ({ ...current, filePath: event.target.value }))}
              placeholder="filePath"
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            />
            <input
              value={fileForm.language}
              onChange={(event) => setFileForm((current) => ({ ...current, language: event.target.value }))}
              placeholder="language"
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
            <textarea
              value={fileForm.content}
              onChange={(event) => setFileForm((current) => ({ ...current, content: event.target.value }))}
              placeholder="content"
              rows={14}
              className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void saveFile()}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              파일 저장
            </button>
            {selectedFileId && (
              <button
                type="button"
                onClick={() => void deleteFile()}
                className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
              >
                삭제
              </button>
            )}
          </div>
        </AdminCard>

        <AdminCard>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold">미션</h3>
            <button
              type="button"
              onClick={() => {
                setSelectedMissionId(null);
                setMissionForm(emptyMission);
                setValidationText('{}');
              }}
              className="rounded-md bg-slate-950 px-3 py-2 text-xs font-semibold text-white"
            >
              새 미션
            </button>
          </div>

          {!practice.missions.length ? (
            <AdminEmpty message="등록된 미션이 없습니다." />
          ) : (
            <div className="mb-4 space-y-2">
              {practice.missions.map((mission) => (
                <button
                  key={mission.id}
                  type="button"
                  onClick={() => selectMission(mission)}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                    selectedMission?.id === mission.id ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  <span className="font-semibold">{mission.title}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {mission.missionType ?? mission.type} · order {mission.orderIndex}
                  </span>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <input
              value={missionForm.title}
              onChange={(event) => setMissionForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="title"
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
              placeholder="description"
              rows={4}
              className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <textarea
              value={validationText}
              onChange={(event) => setValidationText(event.target.value)}
              placeholder="validationJson"
              rows={14}
              className="md:col-span-2 rounded-md border border-slate-300 px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => void saveMission()}
              className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
            >
              미션 저장
            </button>
            {selectedMissionId && (
              <button
                type="button"
                onClick={() => void deleteMission()}
                className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
              >
                삭제
              </button>
            )}
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
