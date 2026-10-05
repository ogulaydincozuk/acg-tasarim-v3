import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MAIN_NAV } from '../../data/taxonomy';
import { cx } from '../../lib/format';
import s from './CategoryRail.module.css';

/**
 * Kategori rail'i: logo satırından ayrı, ince ve sakin bir navigasyon şeridi.
 * Masaüstünde ortalı; dar ekranda yatay kaydırılır ve aktif öğe görünür alana getirilir.
 */
export function CategoryRail({ label = 'Ana kategoriler' }: { label?: string }) {
  const list = useRef<HTMLUListElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const ul = list.current;
    const active = ul?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!ul || !active || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollLeft = active.offsetLeft - (ul.clientWidth - active.offsetWidth) / 2;
  }, [pathname]);

  return (
    <nav className={s.nav} aria-label={label}>
      <ul ref={list} className={cx(s.list, 'no-scrollbar')}>
        {MAIN_NAV.map((item) => (
          <li key={item.label}>
            <NavLink to={item.to} className={({ isActive }) => cx(s.link, isActive && s.active, item.accent && s.accent)}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
