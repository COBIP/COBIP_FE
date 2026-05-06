'use client';

import { useState } from 'react';
import { type Language, type ProjectTemplate, type File, type RightPanelTab, type TerminalLog } from '@/app/types/Playground';
import { LANGUAGE_CONFIGS } from '@/data/Languages';
import { PROJECT_TEMPLATES } from '@/data/Templates';
import { Toolbar } from '@/features/playground-ide/components/Toolbar';
import { FileExplorer } from '@/features/playground-ide/components/FileExplorer';
import { Editor } from '@/features/playground-ide/components/Editor';
import { Terminal } from '@/features/playground-ide/components/Terminal';
import { RightPanel } from '@/features/playground-ide/components/RightPanel';

export default function PlaygroundPage() {

  // 선택된 언어
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');

  // 선택된 템플릿
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate>('none');

  // 파일 목록
  const [files, setFiles] = useState<File[]>([
    {
      id: '1',
      name: `main${LANGUAGE_CONFIGS.javascript.extension}`,
      language: 'javascript',
      content: LANGUAGE_CONFIGS.javascript.defaultCode,
    },
  ]);

  // 활성 파일 ID
  const [activeFileId, setActiveFileId] = useState('1');

  // 터미널 로그
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([
    { id: '1', message: '$ Welcome to Playground', type: 'info', timestamp: new Date() },
    { id: '2', message: '$ Ready to code!', type: 'info', timestamp: new Date() },
  ]);

  // 우측 패널 탭
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>('cheatsheet');

  // 메모장 내용
  const [notes, setNotes] = useState('');

  // 현재 활성 파일
  const activeFile = files.find((f) => f.id === activeFileId);

  // ===== 핸들러 함수 =====

  /**
   * 프로젝트 템플릿 변경
   */
  const handleTemplateChange = (template: ProjectTemplate) => {
    setSelectedTemplate(template);

    if (template === 'none') {
      // 단일 파일 모드
      setFiles([
        {
          id: '1',
          name: `main${LANGUAGE_CONFIGS[selectedLanguage].extension}`,
          language: selectedLanguage,
          content: LANGUAGE_CONFIGS[selectedLanguage].defaultCode,
        },
      ]);
      setActiveFileId('1');
    } else {
      // 템플릿 모드
      const templateFiles = PROJECT_TEMPLATES[template].files.map((file: { name: string; language: Language; content: string }, idx: number) => ({
        id: `${idx}`,
        ...file,
      }));
      setFiles(templateFiles);
      setActiveFileId('0');
    }

    // 터미널에 로그 추가
    const now = new Date();
    setTerminalLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        message: `$ Template changed to: ${PROJECT_TEMPLATES[template].name}`,
        type: 'info',
        timestamp: now,
      },
    ]);
  };

  /**
   * 언어 변경
   */
  const handleLanguageChange = (lang: Language) => {
    setSelectedLanguage(lang);

    if (selectedTemplate === 'none') {
      setFiles((prevFiles) =>
        prevFiles.map((file) => {
          if (file.id === activeFileId) {
            return {
              ...file,
              language: lang,
              name: `main${LANGUAGE_CONFIGS[lang].extension}`,
              content: LANGUAGE_CONFIGS[lang].defaultCode,
            };
          }
          return file;
        })
      );
    }
  };

  /**
   * 코드 변경
   */
  const handleCodeChange = (newCode: string) => {
    setFiles((prevFiles) =>
      prevFiles.map((file) =>
        file.id === activeFileId ? { ...file, content: newCode } : file
      )
    );
  };

  /**
   * 파일 선택
   */
  const handleFileSelect = (fileId: string) => {
    setActiveFileId(fileId);
  };

  /**
   * 파일 추가
   */
  const handleAddFile = () => {
    const newFileId = Date.now().toString();
    const newFile: File = {
      id: newFileId,
      name: `file${files.length + 1}${LANGUAGE_CONFIGS[selectedLanguage].extension}`,
      language: selectedLanguage,
      content: LANGUAGE_CONFIGS[selectedLanguage].defaultCode,
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFileId);
  };

  /**
   * 파일 삭제
   */
  const handleDeleteFile = (fileId: string) => {
    if (files.length === 1) {
      alert('최소 1개의 파일이 필요합니다.');
      return;
    }
    const newFiles = files.filter((f) => f.id !== fileId);
    setFiles(newFiles);
    if (activeFileId === fileId) {
      setActiveFileId(newFiles[0].id);
    }
  };

  /**
   * 실행 시뮬레이션
   */
  const handleRun = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const fileName = activeFile?.name || 'main';

    const newLogs: TerminalLog[] = [
      ...terminalLogs,
      {
        id: Date.now().toString(),
        message: `[${timeString}] Running ${fileName}...`,
        type: 'info',
        timestamp: now,
      },
      {
        id: (Date.now() + 1).toString(),
        message: '> Hello World!',
        type: 'success',
        timestamp: now,
      },
      {
        id: (Date.now() + 2).toString(),
        message: `[${timeString}] Process completed.`,
        type: 'info',
        timestamp: now,
      },
    ];

    setTerminalLogs(newLogs);
  };

  /**
   * 터미널 초기화
   */
  const handleClearTerminal = () => {
    setTerminalLogs([
      {
        id: Date.now().toString(),
        message: '$ Terminal cleared',
        type: 'info',
        timestamp: new Date(),
      },
    ]);
  };

  /**
   * 코드 다운로드
   */
  const handleDownloadCode = () => {
    const allCode = files
      .map((file) => `// ===== ${file.name} =====\n${file.content}`)
      .join('\n\n');

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      'data:text/plain;charset=utf-8,' + encodeURIComponent(allCode)
    );
    element.setAttribute('download', 'playground-code.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // ===== 렌더링 =====

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100">
      {/* 좌측: 파일 탐색기 */}
      <FileExplorer
        files={files}
        activeFileId={activeFileId}
        selectedTemplate={selectedTemplate}
        onFileSelect={handleFileSelect}
        onFileDelete={handleDeleteFile}
        onAddFile={handleAddFile}
      />

      {/* 중앙: 에디터 + 터미널 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 도구바 */}
        <Toolbar
          selectedLanguage={selectedLanguage}
          selectedTemplate={selectedTemplate}
          activeFile={activeFile}
          onLanguageChange={handleLanguageChange}
          onTemplateChange={handleTemplateChange}
          onRun={handleRun}
          onDownload={handleDownloadCode}
        />

        {/* 에디터 */}
        <Editor activeFile={activeFile} onCodeChange={handleCodeChange} />

        {/* 터미널 */}
        <Terminal logs={terminalLogs} onClear={handleClearTerminal} />
      </div>

      {/* 우측: 패널 (Cheat Sheet & Notes) */}
      <RightPanel
        activeTab={rightPanelTab}
        selectedLanguage={selectedLanguage}
        selectedTemplate={selectedTemplate}
        notes={notes}
        onTabChange={setRightPanelTab}
        onNotesChange={setNotes}
      />
    </div>
  );
}