import { AnnouncementBarView, AnnouncementCard } from '../components/Announcement';
import type { AnnInput } from './api';
import { isValidDate, todayIso } from './validate';
import styles from './admin.module.less';

export function Preview({ value }: { value: AnnInput }) {
  const today = todayIso();
  const startsOn = isValidDate(value.startsOn) ? value.startsOn : today;
  const endsOn = isValidDate(value.endsOn) && value.endsOn >= startsOn ? value.endsOn : startsOn;
  const ann = {
    title: value.title.trim() || 'Nadpis oznamu',
    body: value.body.trim() || 'Sem príde text oznamu, ktorý sa návštevníkom zobrazí v okne.',
    startsAt: `${startsOn} 00:00:00`,
    endsAt: `${endsOn} 23:59:59`,
  };
  return (
    <section className={styles.preview} aria-label="Náhľad oznamu">
      <p className={styles.previewLabel}>Náhľad · okno pri prvej návšteve</p>
      <div className={styles.previewStage}>
        <AnnouncementCard ann={ann} isStatic />
      </div>
      <p className={styles.previewLabel}>Náhľad · lišta v spodnej časti stránky</p>
      <AnnouncementBarView ann={ann} isStatic />
    </section>
  );
}
