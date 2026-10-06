'use client';

import { useMemo, useState, useTransition } from 'react';

import { AdminSurface, AdminEmptyState, StatusPill } from '@/components/admin/primitives';
import { AdminCollapsible } from '@/components/admin/Collapsible';
import { useToast } from '@/components/admin/Toast';
import { useConfirm } from '@/components/admin/useConfirm';
import {
  REVISION_STATUSES,
  type RevisionRequest,
  type RevisionComment,
  type RevisionStatus,
} from '@/lib/db/admin/revision-types';
import { STATUS_LABELS, STATUS_TONE, urgencyTone, ACTIVE_FILTERS } from './RevisionsClient.helpers';
import {
  createRevisionAction,
  updateRevisionStatusAction,
  deleteRevisionAction,
  addCommentAction,
  deleteCommentAction,
} from './actions';

/* --- Threaded comments under a single revision ----------------------------- */

function RevisionComments({
  revisionId,
  initial,
}: {
  revisionId: string;
  initial: RevisionComment[];
}) {
  const toast = useToast();
  const [comments, setComments] = useState(initial);
  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !body.trim()) return;
    setPosting(true);
    const result = await addCommentAction(revisionId, author.trim(), body.trim());
    setPosting(false);
    if (result.ok && result.data) {
      setComments((prev) => [...prev, result.data as RevisionComment]);
      setBody('');
      toast.success('Yorum eklendi.');
    } else if (!result.ok) {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    const result = await deleteCommentAction(id);
    setBusyId(null);
    if (result.ok) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="border-stone/70 mt-4 border-t pt-3">
      <div className="font-body text-muted mb-2 text-[11px] font-bold tracking-[0.14em] uppercase">
        Yorumlar{comments.length > 0 ? ` (${comments.length})` : ''}
      </div>

      {comments.length > 0 && (
        <ul className="mb-3 space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="group border-stone bg-marble rounded-md border px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-body text-charcoal text-xs font-semibold">{c.author}</span>
                <span className="font-body text-muted text-[10px] tracking-[0.1em] uppercase">
                  {new Date(c.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
              <p className="font-body text-charcoal/80 mt-1 text-[13px] leading-5 whitespace-pre-wrap">
                {c.body}
              </p>
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => handleDelete(c.id)}
                className="font-body text-wine/70 hover:text-wine mt-1 text-[10px] font-semibold opacity-0 transition group-hover:opacity-100 disabled:opacity-40"
              >
                Sil
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex flex-wrap items-start gap-2">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Adınız"
          className="border-stone bg-marble font-body text-charcoal focus:border-olive w-28 rounded-md border px-2.5 py-1.5 text-xs outline-none"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Yorum yazın…"
          rows={1}
          className="border-stone bg-marble font-body text-charcoal focus:border-olive min-w-0 flex-1 resize-y rounded-md border px-2.5 py-1.5 text-xs outline-none"
        />
        <button
          type="submit"
          disabled={posting || !author.trim() || !body.trim()}
          className="bg-olive font-body text-ivory hover:bg-olive-deep rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40"
        >
          {posting ? '…' : 'Ekle'}
        </button>
      </form>
    </div>
  );
}

/* --- New revision request form --------------------------------------------- */

function NewRevisionForm({ onCreated }: { onCreated: () => void }) {
  const toast = useToast();
  const [requester, setRequester] = useState('');
  const [body, setBody] = useState('');
  const [urgency, setUrgency] = useState(5);
  const [status, setStatus] = useState<RevisionStatus>('open');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requester.trim() || !body.trim()) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.set('requester', requester.trim());
    formData.set('body', body.trim());
    formData.set('urgency', String(urgency));
    formData.set('status', status);

    const result = await createRevisionAction(null, formData);
    setSubmitting(false);

    if (result.ok) {
      toast.success('Revizyon isteği eklendi.');
      setRequester('');
      setBody('');
      setUrgency(5);
      setStatus('open');
      onCreated();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="font-body text-charcoal mb-1 block text-sm font-medium">Kimsin?</label>
        <input
          value={requester}
          onChange={(e) => setRequester(e.target.value)}
          required
          placeholder="Adınız (örn: Simge)"
          className="border-stone bg-marble font-body text-charcoal focus:border-olive w-full rounded-md border px-4 py-2.5 outline-none"
        />
      </div>
      <div>
        <label className="font-body text-charcoal mb-1 block text-sm font-medium">
          Revizyon isteğin nedir?
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={5}
          placeholder="Hangi değişiklik isteniyor?"
          className="border-stone bg-marble font-body text-charcoal focus:border-olive w-full resize-y rounded-md border px-4 py-2.5 outline-none"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="font-body text-charcoal mb-1 block text-sm font-medium">
            Aciliyet (1-10)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={urgency}
            onChange={(e) => setUrgency(Number(e.target.value))}
            className="border-stone bg-marble font-body text-charcoal focus:border-olive w-full rounded-md border px-4 py-2.5 outline-none"
          />
        </div>
        <div>
          <label className="font-body text-charcoal mb-1 block text-sm font-medium">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RevisionStatus)}
            className="border-stone bg-marble font-body text-charcoal focus:border-olive w-full cursor-pointer rounded-md border px-4 py-2.5 outline-none"
          >
            {REVISION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="bg-terracotta font-body text-ivory hover:bg-terracotta/90 rounded-md px-6 py-2.5 font-medium transition-colors disabled:opacity-50"
      >
        {submitting ? 'Ekleniyor…' : 'İsteği Kaydet'}
      </button>
    </form>
  );
}

/* --- Main client ----------------------------------------------------------- */

export function RevisionsClient({
  initialRevisions,
  initialComments,
}: {
  initialRevisions: RevisionRequest[];
  initialComments: RevisionComment[];
}) {
  const toast = useToast();
  const { confirm, dialog } = useConfirm();
  const [revisions, setRevisions] = useState(initialRevisions);
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'progress'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const commentsByRevision = useMemo(() => {
    const map = new Map<string, RevisionComment[]>();
    for (const c of initialComments) {
      const bucket = map.get(c.revisionId) ?? [];
      bucket.push(c);
      map.set(c.revisionId, bucket);
    }
    return map;
  }, [initialComments]);

  const doneItems = revisions.filter((r) => r.status === 'done');
  const activeItems = revisions.filter((r) => r.status !== 'done');
  const filteredActive =
    activeFilter === 'all' ? activeItems : activeItems.filter((r) => r.status === activeFilter);

  const refresh = () => {
    // Server action already revalidated; pull fresh data on next navigation.
    // For instant feedback we mutate local state in the handlers below.
    startTransition(() => {});
  };

  const handleStatus = (id: string, status: RevisionStatus) => {
    const previous = revisions;
    setBusyId(id);
    setRevisions((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    startTransition(async () => {
      const result = await updateRevisionStatusAction(id, status);
      setBusyId(null);
      if (result.ok) {
        toast.success(`Durum güncellendi: ${STATUS_LABELS[status]}`);
      } else {
        setRevisions(previous);
        toast.error(result.error);
      }
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm({
      title: 'Bu istek silinsin mi?',
      description: 'Bu işlem geri alınamaz. İsteğe ait yorumlar da silinir.',
      confirmLabel: 'Sil',
      destructive: true,
    });
    if (!ok) return;

    const previous = revisions;
    setBusyId(id);
    setRevisions((prev) => prev.filter((r) => r.id !== id));
    const result = await deleteRevisionAction(id);
    setBusyId(null);
    if (result.ok) {
      toast.success('İstek silindi.');
    } else {
      setRevisions(previous);
      toast.error(result.error);
    }
  };

  const renderCard = (r: RevisionRequest) => (
    <div
      key={r.id}
      className={`border-stone bg-cream-deep/30 rounded-lg border border-l-4 p-5 shadow-[0_12px_30px_rgba(35,33,28,0.05)] ${
        r.status === 'done' ? 'border-l-stone' : 'border-l-terracotta'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-body text-charcoal font-semibold">{r.requester}</span>
        <StatusPill tone={urgencyTone(r.urgency)}>Aciliyet {r.urgency}/10</StatusPill>
        <StatusPill tone={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</StatusPill>
        <span className="font-body text-muted text-xs tracking-[0.12em] uppercase">
          {new Date(r.createdAt).toLocaleString('tr-TR')}
        </span>
      </div>
      <p className="font-body text-charcoal/80 mb-4 text-sm leading-7 whitespace-pre-wrap">
        {r.body}
      </p>
      <div className="flex flex-wrap gap-2">
        {REVISION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busyId === r.id || r.status === s}
            onClick={() => handleStatus(r.id, s)}
            className={`font-body rounded-full px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
              r.status === s
                ? 'bg-olive text-ivory'
                : 'border-stone text-olive hover:bg-cream-deep border'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <button
          type="button"
          disabled={busyId === r.id}
          onClick={() => handleDelete(r.id)}
          className="border-wine/40 font-body text-wine hover:bg-wine/5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40"
        >
          Sil
        </button>
      </div>
      <RevisionComments revisionId={r.id} initial={commentsByRevision.get(r.id) ?? []} />
    </div>
  );

  return (
    <div className="space-y-6">
      <AdminCollapsible
        title="Yeni revizyon isteği"
        description="Ekibin görmek istediği değişikliği kısa, net ve öncelikli biçimde girin."
      >
        <NewRevisionForm onCreated={refresh} />
      </AdminCollapsible>

      {doneItems.length > 0 && (
        <AdminCollapsible
          title={`Tamamlananlar (${doneItems.length})`}
          description="Tamamlandı olarak işaretlenmiş revizyon istekleri."
          contentClassName="space-y-3"
        >
          {doneItems.map(renderCard)}
        </AdminCollapsible>
      )}

      <AdminSurface
        title={`${activeItems.length} aktif revizyon isteği`}
        description="Durum güncellemeleri ve silme işlemleri kartlar üzerinden yapılır."
        actions={
          <div className="flex flex-wrap gap-1.5">
            {ACTIVE_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={`font-body rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  activeFilter === f.key
                    ? 'bg-charcoal text-ivory'
                    : 'border-stone text-olive hover:bg-cream-deep border'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        }
        contentClassName="space-y-3"
      >
        {activeItems.length === 0 && (
          <AdminEmptyState
            title="Aktif revizyon isteği yok"
            description="Açık veya devam eden istekler burada önceliklendirilmiş kartlar olarak listelenir. Tamamlananlar yukarıdaki kartta toplanır."
          />
        )}

        {activeItems.length > 0 && filteredActive.length === 0 && (
          <AdminEmptyState
            title="Bu filtreye uygun istek yok"
            description="Farklı bir durum filtresi seçin."
          />
        )}

        {filteredActive.map(renderCard)}
      </AdminSurface>

      {dialog}
    </div>
  );
}
