import s from './Breadcrumb.module.less';

export function Breadcrumb({ current }: { current: string }) {
  return (
    <nav aria-label="Omrvinková navigácia" data-reveal="">
      <ol className={s.list}>
        <li><a href="/">Domov</a></li>
        <li aria-hidden="true">/</li>
        <li><span aria-current="page">{current}</span></li>
      </ol>
    </nav>
  );
}
