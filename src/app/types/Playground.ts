export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'html';
export type ProjectTemplate = 'none' | 'react-spring' | 'nodejs-react' | 'nextjs-api' | 'flask-react';
export type RightPanelTab = 'notes' | 'cheatsheet';

export interface LanguageConfig {
  name: string;
  extension: string;
  icon: string;
  defaultCode: string;
  cheatSheet: string[];
}

export interface ProjectTemplateConfig {
  name: string;
  description: string;
  files: Array<{ name: string; language: Language; content: string }>;
}

export interface File {
  id: string;
  name: string;
  language: Language;
  content: string;
  parentId?: string; // 폴더 ID (폴더 내 파일의 경우)
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string; // 상위 폴더 ID
  expanded?: boolean; // 폴더 확장 상태
}

export interface TerminalLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}
