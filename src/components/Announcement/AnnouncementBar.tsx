import { useEffect, useRef, useState } from 'react';
import { formatRange } from '../../lib/announcement';
import type { AnnouncementContent } from './AnnouncementCard';
import styles from './Announcement.module.less';

type ViewProps = { ann: AnnouncementContent; onMore?: () => void; isStatic?: boolean };

export function AnnouncementBarView({ ann, onMore, isStatic }: ViewProps) {
  const content = (
    <>
      <span className={styles.dot} aria-hidden="true" />
      <span className={styles.barText}>
        <span className={styles.barTitle}>{ann.title}</span> · {formatRange(ann)}
      </span>
    </>
  );
  const cls = isStatic ? `${styles.bar} ${styles.barStatic}` : styles.bar;
  if (!onMore) return <div className={cls}>{content}</div>;
  return (
    <button type="button" className={`${cls} ${styles.barButton}`} onClick={onMore} aria-haspopup="dialog">
      {content}
      <span className="sr-only"> – zobraziť celý oznam</span>
    </button>
  );
}

type Props = { ann: AnnouncementContent; onMore: () => void };

function useBelowHero(): boolean {
  const [below, setBelow] = useState(false);
  useEffect(() => {
    const hero = document.querySelector('main section');
    if (!hero || typeof IntersectionObserver === 'undefined') {
      setBelow(true);
      return;
    }
    const io = new IntersectionObserver(([e]) => setBelow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(hero);
    return () => io.disconnect();
  }, []);
  return below;
}

export function AnnouncementBar({ ann, onMore }: Props) {
  const ref = useRef<HTMLElement>(null);
  const shown = useBelowHero();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const root = document.documentElement;
    const update = () => root.style.setProperty('--ann-bar-h', shown ? `${el.offsetHeight}px` : '0px');
    update();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(update) : null;
    ro?.observe(el);
    return () => {
      ro?.disconnect();
      root.style.removeProperty('--ann-bar-h');
    };
  }, [shown]);

  return (
    <section
      ref={ref}
      role="region"
      aria-label="Oznam"
      aria-hidden={!shown}
      inert={!shown}
      className={`${styles.barFixed} ${shown ? styles.barShown : ''}`}
    >
      <AnnouncementBarView ann={ann} onMore={onMore} />
    </section>
  );
}
