import { useId, useRef, useState, type FormEvent } from 'react';
import type { Announcement } from '../lib/announcement';
import { api, ApiError, AuthError, type AnnInput } from './api';
import { Preview } from './Preview';
import { BODY_MAX, TITLE_MAX, charCount, normalize, todayIso, validate, type FieldErrors } from './validate';
import styles from './admin.module.less';

type Props = {
  item?: Announcement | null;
  onSaved: (message: string) => void;
  onCancel: () => void;
  onAuthLost: () => void;
};

const ORDER: (keyof AnnInput)[] = ['title', 'body', 'startsOn', 'endsOn'];

export function Form({ item, onSaved, onCancel, onAuthLost }: Props) {
  const today = todayIso();
  const [value, setValue] = useState<AnnInput>(() =>
    item
      ? { title: item.title, body: item.body, startsOn: item.startsAt.slice(0, 10), endsOn: item.endsAt.slice(0, 10) }
      : { title: '', body: '', startsOn: today, endsOn: today },
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState('');
  const [busy, setBusy] = useState(false);
  const uid = useId();
  const refs = {
    title: useRef<HTMLInputElement>(null),
    body: useRef<HTMLTextAreaElement>(null),
    startsOn: useRef<HTMLInputElement>(null),
    endsOn: useRef<HTMLInputElement>(null),
  };

  const set = (k: keyof AnnInput) => (e: { target: { value: string } }) => {
    const v = e.target.value;
    setValue((p) => ({ ...p, [k]: v }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function submit(e: FormEvent) {
    e.preventDefault();
    setServerError('');
    const errs = validate(value);
    setErrors(errs);
    const first = ORDER.find((k) => errs[k]);
    if (first) {
      refs[first].current?.focus();
      return;
    }
    setBusy(true);
    try {
      const input = normalize(value);
      if (item) await api.update(item.id, input);
      else await api.create(input);
      onSaved(item ? 'Zmeny boli uložené.' : 'Oznam bol vytvorený.');
    } catch (err) {
      if (err instanceof AuthError) return onAuthLost();
      setServerError(err instanceof ApiError ? err.message : 'Nepodarilo sa spojiť so serverom. Skúste to znova.');
      setBusy(false);
    }
  }

  const id = (k: string) => `${uid}-${k}`;
  const describe = (k: keyof AnnInput, extra?: string) => [extra, errors[k] ? id(`${k}-err`) : ''].filter(Boolean).join(' ') || undefined;
  const fieldError = (k: keyof AnnInput) =>
    errors[k] ? <p id={id(`${k}-err`)} className={styles.fieldError}>{errors[k]}</p> : null;

  return (
    <div className={styles.formLayout}>
      <form className={`${styles.card} ${styles.form}`} onSubmit={submit} noValidate>
        <div className={styles.formHead}>
          <span className={styles.eyebrow}>{item ? 'Úprava' : 'Nový oznam'}</span>
          <h1 className={styles.h1}>{item ? 'Upraviť oznam' : 'Vytvoriť oznam'}</h1>
        </div>

        {serverError && <p role="alert" className={styles.alert}>{serverError}</p>}

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor={id('title')}>Nadpis</label>
            <span id={id('title-count')} className={styles.counter}>{charCount(value.title)} / {TITLE_MAX}</span>
          </div>
          <input
            ref={refs.title}
            id={id('title')}
            className={styles.input}
            value={value.title}
            onChange={set('title')}
            maxLength={TITLE_MAX}
            required
            aria-invalid={errors.title ? true : undefined}
            aria-describedby={describe('title', id('title-count'))}
          />
          {fieldError('title')}
        </div>

        <div className={styles.field}>
          <div className={styles.labelRow}>
            <label htmlFor={id('body')}>Text oznamu</label>
            <span id={id('body-count')} className={styles.counter}>{charCount(value.body)} / {BODY_MAX}</span>
          </div>
          <textarea
            ref={refs.body}
            id={id('body')}
            className={`${styles.input} ${styles.textarea}`}
            value={value.body}
            onChange={set('body')}
            maxLength={BODY_MAX}
            rows={6}
            required
            aria-invalid={errors.body ? true : undefined}
            aria-describedby={describe('body', id('body-count'))}
          />
          {fieldError('body')}
        </div>

        <div className={styles.dates}>
          <div className={styles.field}>
            <label htmlFor={id('from')}>Dátum od</label>
            <input
              ref={refs.startsOn}
              id={id('from')}
              type="date"
              className={styles.input}
              value={value.startsOn}
              onChange={set('startsOn')}
              min={item ? undefined : today}
              required
              aria-invalid={errors.startsOn ? true : undefined}
              aria-describedby={describe('startsOn')}
            />
            {fieldError('startsOn')}
          </div>
          <div className={styles.field}>
            <label htmlFor={id('to')}>Dátum do</label>
            <input
              ref={refs.endsOn}
              id={id('to')}
              type="date"
              className={styles.input}
              value={value.endsOn}
              onChange={set('endsOn')}
              min={value.startsOn || today}
              required
              aria-invalid={errors.endsOn ? true : undefined}
              aria-describedby={describe('endsOn')}
            />
            {fieldError('endsOn')}
          </div>
        </div>
        <p className={styles.hint}>Oznam sa zobrazuje celé dni — od začiatku prvého dňa do konca posledného.</p>

        <div className={styles.actions}>
          <button type="submit" className={styles.btnPrimary} disabled={busy}>
            {busy ? 'Ukladám…' : 'Uložiť oznam'}
          </button>
          <button type="button" className={styles.btnGhost} onClick={onCancel}>Zrušiť</button>
        </div>
      </form>

      <Preview value={value} />
    </div>
  );
}
