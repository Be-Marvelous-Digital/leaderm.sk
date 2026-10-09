import type { Announcement } from '../../lib/announcement';
import { formatRange } from '../../lib/announcement';
import styles from './Announcement.module.less';

export type AnnouncementContent = Pick<Announcement, 'title' | 'body' | 'startsAt' | 'endsAt'>;

type Props = {
  ann: AnnouncementContent;
  titleId?: string;
  onClose?: () => void;
  isStatic?: boolean;
};

export function AnnouncementCard({ ann, titleId, onClose, isStatic }: Props) {
  return (
    <div className={isStatic ? `${styles.card} ${styles.cardStatic}` : styles.card}>
      <span className={styles.eyebrow}>Oznam</span>
      <h2 id={titleId} className={styles.title}>{ann.title}</h2>
      <span className={styles.chip}>{formatRange(ann)}</span>
      <p className={styles.body}>{ann.body}</p>
      {onClose ? (
        <button type="button" className={styles.btn} onClick={onClose} autoFocus>Rozumiem</button>
      ) : (
        <span className={styles.btn} aria-hidden="true">Rozumiem</span>
      )}
    </div>
  );
}
