import { AdminPageHeader } from '@/components/admin/primitives';
import { listRevisions, listComments } from '@/lib/db/admin/revisions';
import { RevisionsClient } from './RevisionsClient';

export default async function RevisionsPage() {
  const revisions = await listRevisions();
  const comments = await listComments(revisions.map((r) => r.id));

  return (
    <>
      <AdminPageHeader
        eyebrow="Çalışma Alanı"
        title="Revizyonlar"
        description="İç ekip değişiklik isteklerini önceliklendirin, durumlarını ve yorumlarını yönetin."
      />
      <RevisionsClient initialRevisions={revisions} initialComments={comments} />
    </>
  );
}
