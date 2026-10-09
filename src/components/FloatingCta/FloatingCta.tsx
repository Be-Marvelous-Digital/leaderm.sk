import { useEffect, useState } from 'react';
import { CONTACT, ECAKAREN, mailto } from '../../data/site';
import { useScrollY } from '../../hooks/useScrollY';
import s from './FloatingCta.module.less';

export function FloatingCta() {
  const y = useScrollY();
  const [vh, setVh] = useState(800);
  useEffect(() => setVh(innerHeight), [y]);
  const on = y > vh * 0.9;
  return (
    <div className={`${s.bar} ${on ? s.on : ''}`} aria-hidden={!on} inert={!on}>
      <a href={ECAKAREN.profile} target="_blank" rel="noopener" className={s.main}>Do poradia</a>
      <a href={`tel:${CONTACT.tel}`} className={s.sub}>Zavolať</a>
      <a href={mailto('Dopyt z webu')} className={s.sub}>E-mail</a>
    </div>
  );
}
