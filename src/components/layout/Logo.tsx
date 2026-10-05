import { Link } from 'react-router-dom';
import { BRAND } from '../../data/images';
import { cx } from '../../lib/format';
import s from './Logo.module.css';

/**
 * Logo orijinal dosyadan türetilmiştir; yeniden çizilmez, oranı korunur.
 * - "lockup": dış halka olmadan sembol + ACG + TASARIM (header)
 * - "badge": dairesel orijinal rozet (footer, favicon)
 */
export function Logo({ variant = 'lockup', className, onClick }: { variant?: 'lockup' | 'badge'; className?: string; onClick?: () => void }) {
  const lockup = variant === 'lockup';
  return (
    <Link to="/" className={cx(s.logo, lockup ? s.lockup : s.badge, className)} aria-label="ACG TASARIM — ana sayfa" onClick={onClick}>
      <picture>
        <source srcSet={lockup ? BRAND.lockup : BRAND.badge} type="image/webp" />
        <img src={lockup ? BRAND.lockupPng : BRAND.badgePng} alt="ACG TASARIM" width={lockup ? 223 : 360} height={lockup ? 240 : 360} />
      </picture>
    </Link>
  );
}
