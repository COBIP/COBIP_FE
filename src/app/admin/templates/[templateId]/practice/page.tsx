import { AdminTemplatePracticePage } from '@/features/admin/components/AdminTemplatePracticePage';

interface AdminTemplatePracticeRouteProps {
  params: Promise<{
    templateId: string;
  }>;
}

export default async function AdminTemplatePracticeRoute({ params }: AdminTemplatePracticeRouteProps) {
  const { templateId } = await params;

  return <AdminTemplatePracticePage templateId={Number(templateId)} />;
}
