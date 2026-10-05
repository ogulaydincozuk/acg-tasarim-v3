import { Link } from 'react-router-dom';
import { STORE } from '../../data/content';
import { UTILITY_LINKS } from '../../data/taxonomy';
import { useAccount } from '../../context/AccountContext';
import { formatCount } from '../../lib/format';
import s from './UtilityBar.module.css';

/** Header'ın en üst katmanı: ince, sessiz, metin tabanlı. Sol marka cümlesi · sağ yardım bağlantıları. */
export function UtilityBar() {
  const { user } = useAccount();
  return (
    <div className={s.bar}>
      <div className={`container ${s.inner}`}>
        <div className={s.lead}>
          <p className={s.tagline}>Üretimin için ihtiyacın olan her şey.</p>
          <p className={s.note}>{formatCount(STORE.freeShippingThreshold)} TL üzeri ücretsiz kargo</p>
        </div>

        <nav aria-label="Yardım ve hesap">
          <ul className={s.links}>
            {UTILITY_LINKS.map((link) => (
              <li key={link.label}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
            <li className={s.account}>
              <Link to="/hesap">{user ? `Hesabım · ${user.name.split(' ')[0]}` : 'Giriş yap'}</Link>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
