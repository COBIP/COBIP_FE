import { AdminGrammarTemplateEditor } from '@/components/editor/AdminGrammarTemplateEditor';

interface AdminGrammarTemplatesPageProps {
  searchParams?: Promise<{
    templateId?: string;
  }>;
}

export default async function AdminGrammarTemplatesPage({
  searchParams,
}: AdminGrammarTemplatesPageProps) {
  const params = await searchParams;

  return <AdminGrammarTemplateEditor initialTemplateId={params?.templateId} />;
}
