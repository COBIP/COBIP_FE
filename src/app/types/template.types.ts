export interface TemplateMenu {
  id: string;
  label: string;
}

export interface TemplateSidebarProps {
  activeMenu: string;
  onMenuChange: (menu: string) => void;
  progress: number;
}

export interface TemplateSectionProps {
}