import { CONTACT } from '../../data/site';
import s from './Map.module.less';

export function Map({ className }: { className?: string }) {
  return (
    <div className={`${s.frame} ${className ?? ''}`}>
      <iframe title="Mapa, Areál zdravia Galanta" src={CONTACT.mapEmbed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" className={s.iframe} />
    </div>
  );
}
