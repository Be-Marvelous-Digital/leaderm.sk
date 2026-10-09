import { useEffect, useId, useRef, useState } from 'react';
import styles from './admin.module.less';

type Props = {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({ title, message, confirmLabel, onConfirm, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const returnTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      if (returnTo?.isConnected) returnTo.focus();
    };
  }, []);

  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  };

  return (
    <dialog
      ref={ref}
      className={styles.confirm}
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(e) => { e.preventDefault(); if (!busy) onClose(); }}
      onClick={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}
    >
      <div className={styles.confirmCard}>
        <h2 id={titleId} className={styles.h2}>{title}</h2>
        <p id={descId} className={styles.confirmText}>{message}</p>
        <div className={styles.actions}>
          <button type="button" className={styles.btnDanger} onClick={confirm} disabled={busy}>
            {busy ? 'Pracujem…' : confirmLabel}
          </button>
          <button type="button" className={styles.btnGhost} onClick={onClose} disabled={busy} autoFocus>Zrušiť</button>
        </div>
      </div>
    </dialog>
  );
}
