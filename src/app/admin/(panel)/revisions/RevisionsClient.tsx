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
import {
  createRevisionAction,
  updateRevisionStatusAction,
  deleteRevisionAction,
  addCommentAction,
  deleteCommentAction,
} from './actions';

const STATUS_LABELS: Record<RevisionStatus, string> = {
  open: 'Açık',
  progress: 'Devam Ediyor',
  done: 'Tamamlandı',
};

const STATUS_TONE: Record<RevisionStatus, 'terracotta' | 'olive' | 'neutral'> = {
  open: 'terracotta',
  progress: 'olive',
  done: 'neutral',
};

function urgencyTone(u: number): 'wine' | 'terracotta' | 'olive' {
  if (u >= 8) return 'wine';
  if (u >= 4) return 'terracotta';
  return 'olive';
}

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
    <div className="mt-4 border-t border-stone/70 pt-3">
      <div className="mb-2 font-body text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
        Yorumlar{comments.length > 0 ? ` (${comments.length})` : ''}
      </div>

      {comments.length > 0 && (
        <ul className="mb-3 space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="group rounded-md border border-stone bg-marble px-3 py-2">
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-body text-xs font-semibold text-charcoal">{c.author}</span>
                <span className="font-body text-[10px] uppercase tracking-[0.1em] text-muted">
                  {new Date(c.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
              <p className="mt-1 whitespace-pre-wrap font-body text-[13px] leading-5 text-charcoal/80">
                {c.body}
              </p>
              <button
                type="button"
                disabled={busyId === c.id}
                onClick={() => handleDelete(c.id)}
                className="mt-1 font-body text-[10px] font-semibold text-wine/70 opacity-0 transition hover:text-wine group-hover:opacity-100 disabled:opacity-40"
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
          className="w-28 rounded-md border border-stone bg-marble px-2.5 py-1.5 font-body text-xs text-charcoal outline-none focus:border-olive"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Yorum yazın…"
          rows={1}
          className="min-w-0 flex-1 resize-y rounded-md border border-stone bg-marble px-2.5 py-1.5 font-body text-xs text-charcoal outline-none focus:border-olive"
        />
        <button
          type="submit"
          disabled={posting || !author.trim() || !body.trim()}
          className="rounded-md bg-olive px-3 py-1.5 font-body text-xs font-semibold text-ivory transition-colors hover:bg-olive-deep disabled:opacity-40"
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
        <label className="mb-1 block font-body text-sm font-medium text-charcoal">Kimsin?</label>
        <input
          value={requester}
          onChange={(e) => setRequester(e.target.value)}
          required
          placeholder="Adınız (örn: Simge)"
          className="w-full rounded-md border border-stone bg-marble px-4 py-2.5 font-body text-charcoal outline-none focus:border-olive"
        />
      </div>
      <div>
        <label className="mb-1 block font-body text-sm font-medium text-charcoal">
          Revizyon isteğin nedir?
        </label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={5}
          placeholder="Hangi değişiklik isteniyor?"
          className="w-full resize-y rounded-md border border-stone bg-marble px-4 py-2.5 font-body text-charcoal outline-none focus:border-olive"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-charcoal">
            Aciliyet (1-10)
          </label>
          <input
            type="number"
            min={1}
            max={10}
            value={urgency}
            onChange={(e) => setUrgency(Number(e.target.value))}
            className="w-full rounded-md border border-stone bg-marble px-4 py-2.5 font-body text-charcoal outline-none focus:border-olive"
          />
        </div>
        <div>
          <label className="mb-1 block font-body text-sm font-medium text-charcoal">Durum</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as RevisionStatus)}
            className="w-full cursor-pointer rounded-md border border-stone bg-marble px-4 py-2.5 font-body text-charcoal outline-none focus:border-olive"
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
        className="rounded-md bg-terracotta px-6 py-2.5 font-body font-medium text-ivory transition-colors hover:bg-terracotta/90 disabled:opacity-50"
      >
        {submitting ? 'Ekleniyor…' : 'İsteği Kaydet'}
      </button>
    </form>
  );
}

/* --- Main client ----------------------------------------------------------- */

const ACTIVE_FILTERS: { key: 'all' | 'open' | 'progress'; label: string }[] = [
  { key: 'all', label: 'Tümü' },
  { key: 'open', label: STATUS_LABELS.open },
  { key: 'progress', label: STATUS_LABELS.progress },
];

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
      className={`rounded-lg border border-stone border-l-4 bg-cream-deep/30 p-5 shadow-[0_12px_30px_rgba(35,33,28,0.05)] ${
        r.status === 'done' ? 'border-l-stone' : 'border-l-terracotta'
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="font-body font-semibold text-charcoal">{r.requester}</span>
        <StatusPill tone={urgencyTone(r.urgency)}>Aciliyet {r.urgency}/10</StatusPill>
        <StatusPill tone={STATUS_TONE[r.status]}>{STATUS_LABELS[r.status]}</StatusPill>
        <span className="font-body text-xs uppercase tracking-[0.12em] text-muted">
          {new Date(r.createdAt).toLocaleString('tr-TR')}
        </span>
      </div>
      <p className="mb-4 whitespace-pre-wrap font-body text-sm leading-7 text-charcoal/80">
        {r.body}
      </p>
      <div className="flex flex-wrap gap-2">
        {REVISION_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={busyId === r.id || r.status === s}
            onClick={() => handleStatus(r.id, s)}
            className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-colors disabled:opacity-40 ${
              r.status === s
                ? 'bg-olive text-ivory'
                : 'border border-stone text-olive hover:bg-cream-deep'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
        <button
          type="button"
          disabled={busyId === r.id}
          onClick={() => handleDelete(r.id)}
          className="rounded-full border border-wine/40 px-3 py-1.5 font-body text-xs font-semibold text-wine transition-colors hover:bg-wine/5 disabled:opacity-40"
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
                className={`rounded-full px-3 py-1.5 font-body text-xs font-semibold transition-colors ${
                  activeFilter === f.key
                    ? 'bg-charcoal text-ivory'
                    : 'border border-stone text-olive hover:bg-cream-deep'
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
