import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Package, Search, User } from 'lucide-react';
import { STORE } from '../../data/content';
import { MAIN_NAV, UTILITY_LINKS } from '../../data/taxonomy';
import { useShop } from '../../context/ShopContext';
import { useAccount } from '../../context/AccountContext';
import { cx } from '../../lib/format';
import { Drawer } from '../ui/Drawer';
import s from './MobileMenu.module.css';

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { setSearchOpen, favorites } = useShop();
  const { user } = useAccount();

  return (
    <Drawer id="mobile-menu" open={open} onClose={onClose} title="Menü" side="left" width={420}>
      <div className={s.wrap}>
        <button
          type="button"
          className={s.search}
          onClick={() => {
            onClose();
            setSearchOpen(true);
          }}
        >
          <Search strokeWidth={1.8} aria-hidden="true" />
          Kalıp, hammadde veya set ara
        </button>

        <nav aria-label="Mobil ana menü">
          <ul className={s.list}>
            {MAIN_NAV.map((item) => (
              <li key={item.label}>
                <Link to={item.to} className={cx(s.row, item.accent && s.rowAccent)} onClick={onClose}>
                  <span className={s.rowLabel}>{item.label}</span>
                  <ArrowRight className={s.rowArrow} strokeWidth={2} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className={s.account}>
          <li className={s.accountMain}>
            <Link to="/hesap" onClick={onClose}>
              <User strokeWidth={1.8} aria-hidden="true" /> {user ? `Hesabım · ${user.name.split(' ')[0]}` : 'Giriş yap / Üye ol'}
            </Link>
          </li>
          <li>
            <Link to="/favoriler" onClick={onClose}>
              <Heart strokeWidth={1.8} aria-hidden="true" /> Favorilerim {favorites.length > 0 && <span className={s.badge}>{favorites.length}</span>}
            </Link>
          </li>
          <li>
            <Link to="/sayfa/siparis-takibi" onClick={onClose}>
              <Package strokeWidth={1.8} aria-hidden="true" /> Siparişlerim
            </Link>
          </li>
        </ul>

        <ul className={s.utility}>
          {UTILITY_LINKS.map((link) => (
            <li key={link.label}>
              <Link to={link.to} onClick={onClose}>
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className={s.contact}>
          {STORE.hours}
          <br />
          {STORE.email}
        </p>
      </div>
    </Drawer>
  );
}
