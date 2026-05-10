import { Play } from 'lucide-react';

// ===== 탐색기 트리 타입 =====
interface ExplorerFile {
  name: string;
  type: 'file';
}
interface ExplorerFolder {
  name: string;
  type: 'folder';
  isOpen: boolean;
  children: ExplorerNode[];
}
type ExplorerNode = ExplorerFile | ExplorerFolder;

function ExplorerFolderNode({
  node,
  activeFile,
  openFile,
  toggleFolder,
  openAddMenu,
  startAddFile,
  startAddFolder,
  addingTarget,
  newItemName,
  setNewItemName,
  confirmAddItem,
  cancelAddItem,
  openMenuFolder,
}: {
  node: ExplorerFolder;
  activeFile: string;
  openFile: (name: string) => void;
  toggleFolder: (name: string) => void;
  openAddMenu: (name: string) => void;
  startAddFile: (folderName: string) => void;
  startAddFolder: (parentFolder: string) => void;
  addingTarget: { mode: 'file' | 'folder'; folderName?: string; parentFolder?: string } | null;
  newItemName: string;
  setNewItemName: (v: string) => void;
  confirmAddItem: () => void;
  cancelAddItem: () => void;
  openMenuFolder: string | null;
}) {
  return (
    <div>
      <div className="flex items-center justify-between group cursor-pointer hover:bg-gray-100 rounded-md px-2 py-1">
        <div className="flex items-center gap-1.5 flex-1 min-w-0" onClick={() => toggleFolder(node.name)}>
          <span className="text-[10px] text-gray-500 transition-transform duration-150">
            {node.isOpen ? '▼' : '▶'}
          </span>
          <span className="text-xs">📁</span>
          <span className="text-xs text-gray-700 font-medium truncate">{node.name}</span>
        </div>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); openAddMenu(node.name); }}
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-600 text-xs px-1 rounded hover:bg-purple-50 transition cursor-pointer"
          >+</button>
          {openMenuFolder === node.name && (
            <div className="absolute right-0 top-5 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[100px]">
              <button
                onClick={(e) => { e.stopPropagation(); startAddFile(node.name); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
              >📄 새 파일</button>
              <button
                onClick={(e) => { e.stopPropagation(); startAddFolder(node.name); }}
                className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition cursor-pointer"
              >📁 새 폴더</button>
            </div>
          )}
        </div>
      </div>
      {node.isOpen && (
        <div className="ml-4 space-y-0.5 mt-0.5">
          {node.children.map((child) =>
            child.type === 'folder' ? (
              <ExplorerFolderNode key={child.name} node={child as ExplorerFolder} activeFile={activeFile} openFile={openFile} toggleFolder={toggleFolder} openAddMenu={openAddMenu} startAddFile={startAddFile} startAddFolder={startAddFolder} addingTarget={addingTarget} newItemName={newItemName} setNewItemName={setNewItemName} confirmAddItem={confirmAddItem} cancelAddItem={cancelAddItem} openMenuFolder={openMenuFolder} />
            ) : (
              <div key={child.name} onClick={() => openFile(child.name)} className={`flex items-center gap-2 px-2 py-1 rounded-md text-xs cursor-pointer transition ${child.name === activeFile ? 'bg-purple-100 text-purple-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}>
                <span className="text-[10px]">📄</span>
                <span>{child.name}</span>
              </div>
            )
          )}
          {addingTarget?.mode === 'file' && addingTarget.folderName === node.name && (
            <div className="flex items-center gap-1 px-2 py-1">
              <span className="text-[10px]">📄</span>
              <input autoFocus value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmAddItem(); if (e.key === 'Escape') cancelAddItem(); }} onBlur={confirmAddItem} className="flex-1 text-xs bg-white border border-purple-300 rounded px-1.5 py-0.5 outline-none text-gray-700" placeholder="파일명.py" />
            </div>
          )}
          {addingTarget?.mode === 'folder' && addingTarget.parentFolder === node.name && (
            <div className="flex items-center gap-1 px-2 py-1">
              <span className="text-xs">📁</span>
              <input autoFocus value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmAddItem(); if (e.key === 'Escape') cancelAddItem(); }} onBlur={confirmAddItem} className="flex-1 text-xs bg-white border border-purple-300 rounded px-1.5 py-0.5 outline-none text-gray-700" placeholder="폴더명" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface CodeRunnerProps {
  runnerWidth: number;
  explorerWidth: number;
  outputHeight: number;
  explorerTree: ExplorerNode[];
  activeFile: string;
  fileContents: Record<string, string>;
  onRunnerResizeStart: (e: React.MouseEvent) => void;
  onExplorerResizeStart: (e: React.MouseEvent) => void;
  onOutputResizeStart: (e: React.MouseEvent) => void;
  toggleFolder: (name: string) => void;
  openAddMenu: (name: string) => void;
  startAddFile: (folderName: string) => void;
  startAddFolder: (parentFolder?: string) => void;
  addRootFolder: () => void;
  addingTarget: { mode: 'file' | 'folder'; folderName?: string; parentFolder?: string } | null;
  newItemName: string;
  setNewItemName: (v: string) => void;
  confirmAddItem: () => void;
  cancelAddItem: () => void;
  openFile: (name: string) => void;
  openMenuFolder: string | null;
  setFileContents: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export function CodeRunner({
  runnerWidth,
  explorerWidth,
  outputHeight,
  explorerTree,
  activeFile,
  fileContents,
  onRunnerResizeStart,
  onExplorerResizeStart,
  onOutputResizeStart,
  toggleFolder,
  openAddMenu,
  startAddFile,
  startAddFolder,
  addRootFolder,
  addingTarget,
  newItemName,
  setNewItemName,
  confirmAddItem,
  cancelAddItem,
  openFile,
  openMenuFolder,
  setFileContents,
}: CodeRunnerProps) {
  return (
    <aside
      className="border-l border-gray-200 bg-gray-50 overflow-hidden shrink-0 relative"
      style={{ width: `${runnerWidth}px` }}
    >
      {/* 리사이즈 핸들 */}
      <div
        className="absolute -left-1 top-0 bottom-0 w-3 z-30 cursor-col-resize flex items-center justify-center group"
        onMouseDown={onRunnerResizeStart}
      >
        <div className="w-0.5 h-8 bg-gray-300 rounded-full group-hover:bg-purple-400 transition-colors" />
      </div>

      <div className="h-full flex flex-col" style={{ width: `${runnerWidth}px` }}>
        {/* 실행 환경 헤더 */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Play className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-800">Python 실행기</span>
          </div>
        </div>

        {/* 본문: 파일트리 + 코드 영역 */}
        <div className="flex flex-1 overflow-hidden">
          {/* 왼쪽: 파일 탐색기 */}
          <div className="flex flex-col shrink-0 overflow-hidden" style={{ width: `${explorerWidth}px` }}>
            <div className="px-3 py-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 bg-gray-100/50 shrink-0">탐색기</div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {explorerTree.map((node) =>
                node.type === 'folder' ? (
                  <ExplorerFolderNode key={node.name} node={node as ExplorerFolder} activeFile={activeFile} openFile={openFile} toggleFolder={toggleFolder} openAddMenu={openAddMenu} startAddFile={startAddFile} startAddFolder={startAddFolder} addingTarget={addingTarget} newItemName={newItemName} setNewItemName={setNewItemName} confirmAddItem={confirmAddItem} cancelAddItem={cancelAddItem} openMenuFolder={openMenuFolder} />
                ) : null
              )}
              {addingTarget?.mode === 'folder' && !addingTarget.parentFolder ? (
                <div className="flex items-center gap-1.5 px-2 py-1 mt-1">
                  <span className="text-xs">📁</span>
                  <input autoFocus value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') confirmAddItem(); if (e.key === 'Escape') cancelAddItem(); }} onBlur={confirmAddItem} className="flex-1 text-xs bg-white border border-purple-300 rounded px-1.5 py-0.5 outline-none text-gray-700" placeholder="폴더명" />
                </div>
              ) : (
                <button onClick={addRootFolder} className="w-full flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-purple-600 hover:bg-gray-100 rounded-md transition cursor-pointer mt-1">
                  <span>+</span><span>폴더 추가</span>
                </button>
              )}
            </div>
          </div>

          {/* 리사이즈 핸들 (파일트리 ↔ 코드) */}
          <div className="w-0.5 cursor-col-resize shrink-0 relative group" onMouseDown={onExplorerResizeStart}>
            <div className="absolute inset-0 -left-1 -right-1" />
            <div className="w-full h-full bg-gray-200 group-hover:bg-purple-400 transition-colors" />
          </div>

          {/* 오른쪽: 코드 편집 + 실행 */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* 파일 타이틀 바 */}
            <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white rounded-t border border-gray-200 border-b-0 text-xs text-gray-700 font-medium">
                <span className="text-[10px]">🐍</span>
                {activeFile}
                <button className="ml-1 text-gray-400 hover:text-gray-600 text-[10px] leading-none">✕</button>
              </div>
            </div>

            {/* 코드 에디터 */}
            <div className="flex-1 bg-gray-50 overflow-hidden">
              <textarea
                className="w-full h-full bg-gray-50 text-gray-800 p-4 text-sm font-mono resize-none outline-none leading-relaxed"
                value={fileContents[activeFile] || ''}
                onChange={(e) => setFileContents((prev) => ({ ...prev, [activeFile]: e.target.value }))}
                placeholder="# 여기에 코드를 입력하세요"
              />
            </div>

            {/* 가로 리사이즈 핸들 */}
            <div className="h-0.5 cursor-row-resize shrink-0 relative group" onMouseDown={onOutputResizeStart}>
              <div className="absolute inset-0 -top-1 -bottom-1" />
              <div className="w-full h-full bg-gray-200 group-hover:bg-purple-500 transition-colors" />
            </div>

            {/* 하단 도구 모음 */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white text-[11px] font-medium rounded-md hover:bg-purple-700 transition cursor-pointer">
                <Play className="w-3 h-3 fill-white" /> 실행
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-gray-600 text-[11px] font-medium rounded-md border border-gray-200 hover:bg-gray-50 hover:border-purple-200 hover:text-purple-600 transition cursor-pointer">
                <span>▶</span> 실행흐름
              </button>
              <div className="flex-1" />
              <span className="text-[10px] text-gray-400">{'// 실행 결과'}</span>
            </div>

            {/* 출력 영역 */}
            <div className="border-t border-gray-200 bg-gray-50 overflow-y-auto shrink-0" style={{ height: `${outputHeight}px` }}>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 border-b border-gray-200 sticky top-0">
                <span className="text-[10px] text-gray-500 font-medium">출력</span>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 font-mono">{'// 실행 결과가 여기에 표시됩니다'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
