import { useId, useState, type FormEvent } from 'react';
import { api, ApiError, type Me } from './api';
import styles from './admin.module.less';

type Props = { notice?: string; onLogin: (me: Me) => void };

export function Login({ notice, onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const uid = useId();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Zadajte e-mail aj heslo.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      onLogin(await api.login(email.trim(), password));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Nepodarilo sa spojiť so serverom. Skúste to znova.');
      setBusy(false);
    }
  }

  return (
    <main className={styles.loginPage}>
      <form className={`${styles.card} ${styles.login}`} onSubmit={submit} noValidate aria-labelledby={`${uid}-h`}>
        <span className={styles.logo} aria-hidden="true">L</span>
        <span className={styles.eyebrow}>Leaderm · Administrácia</span>
        <h1 id={`${uid}-h`} className={styles.h1}>Prihlásenie</h1>
        {notice && !error && <p role="status" className={styles.notice}>{notice}</p>}
        {error && <p role="alert" className={styles.alert}>{error}</p>}
        <div className={styles.field}>
          <label htmlFor={`${uid}-email`}>E-mail</label>
          <input
            id={`${uid}-email`}
            className={styles.input}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.field}>
          <label htmlFor={`${uid}-pw`}>Heslo</label>
          <input
            id={`${uid}-pw`}
            className={styles.input}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={`${styles.btnPrimary} ${styles.btnBlock}`} disabled={busy}>
          {busy ? 'Prihlasujem…' : 'Prihlásiť sa'}
        </button>
      </form>
    </main>
  );
}
