import type { JSONContent } from '@tiptap/core';

export type AdminGrammarTemplateStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type AdminGrammarMediaType = 'IMAGE' | 'VIDEO';

export interface AdminGrammarTemplateMeta {
  title: string;
  language: string;
  category: string;
  difficulty: string;
  status: AdminGrammarTemplateStatus;
}

export interface AdminGrammarSection {
  id: string;
  heading: string;
  content: JSONContent;
  isCollapsed: boolean;
}

export interface AdminGrammarContentSection {
  id: string;
  heading: string;
  content: JSONContent;
}

export interface AdminGrammarContentJson {
  sections: AdminGrammarContentSection[];
}

export interface AdminGrammarTemplatePayload extends AdminGrammarTemplateMeta {
  contentJson: AdminGrammarContentJson;
}

export interface AdminGrammarTemplateResponse {
  id?: string | number;
  templateId?: string | number;
  status?: AdminGrammarTemplateStatus;
}

export interface AdminGrammarMediaResponse {
  fileUrl: string;
  fileKey: string;
}
