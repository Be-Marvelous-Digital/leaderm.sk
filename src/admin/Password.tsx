import { useId, useRef, useState, type FormEvent } from 'react';
import { api, ApiError, AuthError, setCsrf } from './api';
import styles from './admin.module.less';

const MIN = 12;

type Props = { onDone: (flash: string) => void; onCancel: () => void; onAuthLost: () => void };

export function Password({ onDone, onCancel, onAuthLost }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [repeat, setRepeat] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const uid = useId();
  const alertRef = useRef<HTMLParagraphElement>(null);

  function fail(msg: string) {
    setError(msg);
    requestAnimationFrame(() => alertRef.current?.focus());
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!current || !next || !repeat) return fail('Vyplňte všetky polia.');
    if (next.length < MIN) return fail(`Nové heslo musí mať aspoň ${MIN} znakov.`);
    if (next !== repeat) return fail('Nové heslá sa nezhodujú.');
    if (next === current) return fail('Nové heslo musí byť iné ako súčasné.');
    setBusy(true);
    setError('');
    try {
      const r = await api.changePassword(current, next);
      setCsrf(r.csrf);
      onDone('Heslo bolo zmenené.');
    } catch (err) {
      if (err instanceof AuthError) return onAuthLost();
      fail(err instanceof ApiError ? err.message : 'Nepodarilo sa spojiť so serverom. Skúste to znova.');
      setBusy(false);
    }
  }

  const field = (id: string, label: string, value: string, set: (v: string) => void, auto: string, hint?: string) => (
    <div className={styles.field}>
      <label htmlFor={`${uid}-${id}`}>{label}</label>
      <input
        id={`${uid}-${id}`}
        className={styles.input}
        type="password"
        autoComplete={auto}
        value={value}
        onChange={(e) => set(e.target.value)}
        aria-describedby={hint ? `${uid}-${id}-hint` : undefined}
        required
      />
      {hint && <p id={`${uid}-${id}-hint`} className={styles.hint}>{hint}</p>}
    </div>
  );

  return (
    <form className={`${styles.card} ${styles.login}`} onSubmit={submit} noValidate aria-labelledby={`${uid}-h`}>
      <span className={styles.eyebrow}>Účet</span>
      <h1 id={`${uid}-h`} className={styles.h1}>Zmeniť heslo</h1>
      {error && <p ref={alertRef} tabIndex={-1} role="alert" className={styles.alert}>{error}</p>}
      <input type="text" name="username" autoComplete="username" hidden readOnly />
      {field('cur', 'Súčasné heslo', current, setCurrent, 'current-password')}
      {field('new', 'Nové heslo', next, setNext, 'new-password', `Aspoň ${MIN} znakov. Odporúčame vetu alebo kombináciu slov.`)}
      {field('rep', 'Nové heslo znova', repeat, setRepeat, 'new-password')}
      <div className={styles.actions}>
        <button type="submit" className={styles.btnPrimary} disabled={busy}>{busy ? 'Ukladám…' : 'Zmeniť heslo'}</button>
        <button type="button" className={styles.btnGhost} onClick={onCancel}>Zrušiť</button>
      </div>
    </form>
  );
}
