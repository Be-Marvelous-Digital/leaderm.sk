import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { fetchActive, isDismissed, markDismissed, type Announcement } from '../../lib/announcement';
import { AnnouncementBar } from './AnnouncementBar';
import { AnnouncementDialog } from './AnnouncementDialog';

export function AnnouncementHost() {
  const [ann, setAnn] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetchActive(ctrl.signal)
      .then((a) => {
        if (!a) return;
        setAnn(a);
        setOpen(!isDismissed(a));
      })
      .catch(() => {});
    return () => ctrl.abort();
  }, []);

  if (!ann) return null;

  const close = () => {
    markDismissed(ann);
    setOpen(false);
  };

  return createPortal(
    <>
      <AnnouncementBar ann={ann} onMore={() => setOpen(true)} />
      {open && <AnnouncementDialog ann={ann} onClose={close} />}
    </>,
    document.body,
  );
}
