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
}

export interface TerminalLog {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error' | 'warning';
  timestamp: Date;
}
