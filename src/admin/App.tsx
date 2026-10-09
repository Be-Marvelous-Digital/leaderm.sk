import { useCallback, useEffect, useState } from 'react';
import type { Announcement } from '../lib/announcement';
import { api, AuthError, setCsrf, type Me } from './api';
import { Form } from './Form';
import { List } from './List';
import { Login } from './Login';
import { Password } from './Password';
import styles from './admin.module.less';

type User = Me['user'];
type View = { kind: 'list'; flash?: string } | { kind: 'form'; item: Announcement | null } | { kind: 'password' };

export function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<View>({ kind: 'list' });

  useEffect(() => {
    api.me()
      .then((me) => { setCsrf(me.csrf); setUser(me.user); })
      .catch((e) => {
        setUser(null);
        if (!(e instanceof AuthError)) setNotice('Nepodarilo sa spojiť so serverom. Skúste to znova.');
      });
  }, []);

  useEffect(() => {
    document.title = view.kind === 'form'
      ? `${view.item ? 'Upraviť' : 'Nový'} oznam | Administrácia | Leaderm`
      : view.kind === 'password' ? 'Zmeniť heslo | Administrácia | Leaderm' : 'Administrácia | Leaderm';
  }, [view]);

  const onAuthLost = useCallback(() => {
    setUser(null);
    setNotice('Boli ste odhlásený. Prihláste sa znova.');
    setView({ kind: 'list' });
  }, []);

  const logout = async () => {
    try { await api.logout(); } catch { /* session may already be gone */ }
    setCsrf('');
    setUser(null);
    setNotice('Boli ste odhlásený.');
    setView({ kind: 'list' });
  };

  if (user === undefined) return <p className={styles.loading} role="status">Načítavam…</p>;

  if (user === null) {
    return (
      <Login
        notice={notice}
        onLogin={(me) => { setCsrf(me.csrf); setUser(me.user); setNotice(''); }}
      />
    );
  }

  return (
    <div className={styles.shell}>
      <a className="skip-link" href="#obsah">Preskočiť na obsah</a>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">L</span>
          <span className={styles.brandText}>Leaderm <span className={styles.brandSub}>· Administrácia</span></span>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.userName}>{user.name}</span>
          <button type="button" className={styles.btnHeader} onClick={() => setView({ kind: 'password' })} aria-current={view.kind === 'password' ? 'page' : undefined}>Zmeniť heslo</button>
          <button type="button" className={styles.btnHeader} onClick={logout}>Odhlásiť</button>
        </div>
      </header>
      <main id="obsah" tabIndex={-1} className={styles.main}>
        {view.kind === 'list' ? (
          <List
            flash={view.flash}
            onNew={() => setView({ kind: 'form', item: null })}
            onEdit={(item) => setView({ kind: 'form', item })}
            onAuthLost={onAuthLost}
          />
        ) : view.kind === 'password' ? (
          <Password
            onDone={(flash) => setView({ kind: 'list', flash })}
            onCancel={() => setView({ kind: 'list' })}
            onAuthLost={onAuthLost}
          />
        ) : (
          <Form
            key={view.item?.id ?? 'new'}
            item={view.item}
            onSaved={(flash) => setView({ kind: 'list', flash })}
            onCancel={() => setView({ kind: 'list' })}
            onAuthLost={onAuthLost}
          />
        )}
      </main>
    </div>
  );
}
