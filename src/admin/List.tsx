import { useCallback, useEffect, useState } from 'react';
import { formatRange, type Announcement } from '../lib/announcement';
import { api, ApiError, AuthError } from './api';
import { ConfirmDialog } from './ConfirmDialog';
import styles from './admin.module.less';

type Status = 'active' | 'scheduled' | 'ended';
type Props = {
  flash?: string;
  onNew: () => void;
  onEdit: (a: Announcement) => void;
  onAuthLost: () => void;
};
type Pending = { kind: 'end' | 'remove'; item: Announcement };

const toDate = (s: string) => new Date(s.replace(' ', 'T'));

const showsAt = (a: Pick<Announcement, 'startsAt' | 'showsFrom'>) => a.showsFrom ?? a.startsAt;

export function statusOf(a: Pick<Announcement, 'startsAt' | 'endsAt' | 'showsFrom'>, now = new Date()): Status {
  if (toDate(a.endsAt) < now) return 'ended';
  if (toDate(showsAt(a)) > now) return 'scheduled';
  return 'active';
}

const shortDay = (s: string) => { const [, m, d] = s.slice(0, 10).split('-').map(Number); return `${d}. ${m}.`; };

const PILL: Record<Status, { label: string; cls: string }> = {
  active: { label: 'Zobrazuje sa', cls: styles.pillActive },
  scheduled: { label: 'Naplánovaný', cls: styles.pillScheduled },
  ended: { label: 'Ukončený', cls: styles.pillEnded },
};

export function List({ flash, onNew, onEdit, onAuthLost }: Props) {
  const [items, setItems] = useState<Announcement[] | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState(flash ?? '');
  const [pending, setPending] = useState<Pending | null>(null);

  const fail = useCallback((e: unknown) => {
    if (e instanceof AuthError) return onAuthLost();
    setError(e instanceof ApiError ? e.message : 'Nepodarilo sa spojiť so serverom. Skúste to znova.');
  }, [onAuthLost]);

  const load = useCallback(async () => {
    try {
      setItems(await api.list());
      setError('');
    } catch (e) {
      fail(e);
    }
  }, [fail]);

  useEffect(() => { void load(); }, [load]);

  const now = new Date();
  const groups: Record<Status, Announcement[]> = { active: [], scheduled: [], ended: [] };
  for (const a of items ?? []) groups[statusOf(a, now)].push(a);
  groups.scheduled.sort((a, b) => showsAt(a).localeCompare(showsAt(b)));
  groups.ended = groups.ended.sort((a, b) => b.endsAt.localeCompare(a.endsAt)).slice(0, 10);

  const run = async () => {
    if (!pending) return;
    const { kind, item } = pending;
    try {
      if (kind === 'end') await api.end(item.id);
      else await api.remove(item.id);
      setPending(null);
      setStatus(kind === 'end' ? `Oznam „${item.title}“ bol ukončený.` : `Oznam „${item.title}“ bol vymazaný.`);
      await load();
    } catch (e) {
      setPending(null);
      fail(e);
    }
  };

  const section = (key: Status, title: string, empty: string) => (
    <section className={styles.group} aria-labelledby={`grp-${key}`}>
      <h2 id={`grp-${key}`} className={styles.h2}>{title}</h2>
      {groups[key].length === 0 ? (
        <p className={styles.muted}>{empty}</p>
      ) : (
        <ul className={styles.items}>
          {groups[key].map((a) => (
            <li key={a.id} className={styles.item}>
              <div className={styles.itemMain}>
                <div className={styles.itemMeta}>
                  <span className={`${styles.pill} ${PILL[key].cls}`}>{PILL[key].label}</span>
                  <span className={styles.range}>{formatRange(a)}</span>
                  {key === 'scheduled' && <span className={styles.range}>na webe od {shortDay(showsAt(a))}</span>}
                </div>
                <h3 className={styles.itemTitle}>{a.title}</h3>
                <p className={styles.itemBody}>{a.body}</p>
              </div>
              <div className={styles.itemActions}>
                <button type="button" className={styles.btnGhost} onClick={() => onEdit(a)}>
                  Upraviť<span className="sr-only"> oznam „{a.title}“</span>
                </button>
                {key === 'active' && (
                  <button type="button" className={styles.btnGhost} onClick={() => setPending({ kind: 'end', item: a })}>
                    Ukončiť teraz<span className="sr-only"> oznam „{a.title}“</span>
                  </button>
                )}
                <button type="button" className={styles.btnText} onClick={() => setPending({ kind: 'remove', item: a })}>
                  Vymazať<span className="sr-only"> oznam „{a.title}“</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );

  return (
    <div className={styles.listWrap}>
      <div className={styles.listHead}>
        <div>
          <span className={styles.eyebrow}>Oznamy na webe</span>
          <h1 className={styles.h1}>Oznamy</h1>
        </div>
        <button type="button" className={styles.btnPrimary} onClick={onNew}>Nový oznam</button>
      </div>

      <p role="status" className={status ? styles.status : 'sr-only'}>{status}</p>
      {error && <p role="alert" className={styles.alert}>{error}</p>}

      {items === null && !error && <p className={styles.muted}>Načítavam…</p>}

      {items !== null && items.length === 0 && (
        <div className={`${styles.card} ${styles.empty}`}>
          <h2 className={styles.h2}>Zatiaľ žiadne oznamy.</h2>
          <p className={styles.muted}>Oznam sa návštevníkom zobrazí v okne a potom ako lišta v spodnej časti stránky.</p>
          <button type="button" className={styles.btnPrimary} onClick={onNew}>Nový oznam</button>
        </div>
      )}

      {items !== null && items.length > 0 && (
        <>
          {section('active', 'Aktívny', 'Momentálne sa nezobrazuje žiadny oznam.')}
          {section('scheduled', 'Naplánované', 'Žiadne naplánované oznamy.')}
          {section('ended', 'Ukončené', 'Žiadne ukončené oznamy.')}
        </>
      )}

      {pending && (
        <ConfirmDialog
          title={pending.kind === 'end' ? 'Ukončiť oznam?' : 'Vymazať oznam?'}
          message={
            pending.kind === 'end'
              ? `Oznam „${pending.item.title}“ sa prestane zobrazovať na webe.`
              : `Naozaj vymazať oznam „${pending.item.title}“? Túto akciu nie je možné vrátiť.`
          }
          confirmLabel={pending.kind === 'end' ? 'Ukončiť teraz' : 'Vymazať'}
          onConfirm={run}
          onClose={() => setPending(null)}
        />
      )}
    </div>
  );
}
