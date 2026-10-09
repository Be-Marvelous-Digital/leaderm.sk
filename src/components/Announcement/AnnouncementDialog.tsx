import { useEffect, useId, useRef } from 'react';
import { AnnouncementCard, type AnnouncementContent } from './AnnouncementCard';
import styles from './Announcement.module.less';

type Props = { ann: AnnouncementContent; onClose: () => void };

export function AnnouncementDialog({ ann, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeRef.current();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (dialog.open) dialog.close();
      returnTo?.focus();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      className={styles.dialog}
      aria-labelledby={titleId}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <AnnouncementCard ann={ann} titleId={titleId} onClose={onClose} />
    </dialog>
  );
}
