"use client";

import { FunctionalTemplateSidebar } from '@/features/functional-template/components/FunctionalTemplateSidebar';
import { DesignIntentSection } from '@/features/functional-template/components/DesignIntentSection';
import { SourceCodeSection } from '@/features/functional-template/components/SourceCodeSection';
import { MissionSection } from '@/features/functional-template/components/MissionSection';
import { RequirementsSection } from '@/features/functional-template/components/RequirementsSection';
import { StructureSection } from '@/features/functional-template/components/StructureSection';
import { InterviewSection } from '@/features/functional-template/components/InterviewSection';
import { useTemplateMenu } from '@/hooks/useTemplateMenu';

export default function FunctionalTemplateDetail() {
  const { activeMenu, setActiveMenu } = useTemplateMenu();

  const renderContent = () => {
    switch (activeMenu) {
      case 'design-intent':
        return <DesignIntentSection />;
      case 'source-code':
        return <SourceCodeSection />;
      case 'mission':
        return <MissionSection />;
      case 'requirements':
        return <RequirementsSection />;
      case 'structure':
        return <StructureSection />;
      case 'interview':
        return <InterviewSection />;
      default:
        return <DesignIntentSection />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <FunctionalTemplateSidebar
        activeMenu={activeMenu}
        onMenuChange={setActiveMenu}
        progress={15}
      />
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-6 shrink-0">
          <p className="text-sm text-gray-500 mb-2">개발자를 위한</p>
          <h1 className="text-3xl font-bold text-gray-900">사용자 인증 시스템</h1>
        </header>
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-6xl mx-auto">{renderContent()}</div>
        </div>
      </main>
    </div>
  );
}