import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { STORE } from '../../data/content';
import { useMediaQuery } from '../../hooks/useUi';
import { useShop } from '../../context/ShopContext';
import { InstagramIcon, PinterestIcon, TiktokIcon, YoutubeIcon } from '../icons/SocialIcons';
import { Logo } from './Logo';
import s from './Footer.module.css';

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Alışveriş',
    links: [
      { label: 'Kalıplar', to: '/kategori/kaliplar' },
      { label: 'Hammaddeler', to: '/kategori/hammaddeler' },
      { label: 'Başlangıç setleri', to: '/kategori/setler' },
      { label: 'Yeni gelenler', to: '/kategori/yeni-gelenler' },
      { label: 'Yılbaşı koleksiyonu', to: '/kategori/yilbasi' },
      { label: 'Kampanyalar', to: '/kategori/kampanyalar' },
    ],
  },
  {
    title: 'Yardım',
    links: [
      { label: 'Sipariş takibi', to: '/sayfa/siparis-takibi' },
      { label: 'Kargo & teslimat', to: '/sayfa/kargo-teslimat' },
      { label: 'İade & değişim', to: '/sayfa/iade-degisim' },
      { label: 'Sıkça sorulan sorular', to: '/sayfa/sss' },
    ],
  },
  {
    title: 'Kurumsal',
    links: [
      { label: 'Hakkımızda', to: '/sayfa/hakkimizda' },
      { label: 'Toptan & atölye satışı', to: '/sayfa/toptan' },
      { label: 'Özel kalıp üretimi', to: '/sayfa/ozel-kalip' },
    ],
  },
];

/* PLACEHOLDER: ödeme sağlayıcı logoları sözleşme sonrası resmi görsellerle değiştirilecek */
const PAYMENTS = ['VISA', 'Mastercard', 'troy', 'iyzico'];

const SOCIAL = [
  { label: 'Instagram', icon: InstagramIcon, href: STORE.social.instagram },
  { label: 'YouTube', icon: YoutubeIcon, href: STORE.social.youtube },
  { label: 'TikTok', icon: TiktokIcon, href: STORE.social.tiktok },
  { label: 'Pinterest', icon: PinterestIcon, href: STORE.social.pinterest },
];

export function Footer() {
  const year = new Date().getFullYear();
  // Mobilde kolonlar akordeon olarak kapalı başlar
  const desktop = useMediaQuery('(min-width: 768px)');
  const { notify } = useShop();
  return (
    <footer className={s.footer}>
      <div className="container">
        <div className={s.panel}>
          <div className={s.top}>
            <div className={s.brand}>
              <Logo variant="badge" className={s.logo} />
              <p className={s.statement}>
                Üretimin için ihtiyacın
                <br />
                olan her şey.
              </p>
            </div>
            <Link to="/kategori/kaliplar" className="btn btn--soft">
              Alışverişe başla
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className={s.grid}>
            {COLUMNS.map((col) => (
              <details key={col.title} className={s.col} open={desktop}>
                <summary>
                  {col.title}
                  <ChevronDown aria-hidden="true" />
                </summary>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to}>{l.label}</Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}

            <div className={s.col}>
              <p className={s.colTitle}>İletişim</p>
              <ul className={s.contact}>
                <li>{STORE.phone}</li>
                <li>
                  <a href={`mailto:${STORE.email}`}>{STORE.email}</a>
                </li>
                <li>{STORE.address}</li>
                <li className={s.hours}>{STORE.hours}</li>
              </ul>
            </div>
          </div>

          <div className={s.mid}>
            <ul className={s.social}>
              {SOCIAL.map(({ label, icon: Icon, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label}>
                      <Icon />
                    </a>
                  ) : (
                    <button type="button" aria-label={label} onClick={() => notify({ title: `${label} hesabı yakında eklenecek` })}>
                      <Icon />
                    </button>
                  )}
                </li>
              ))}
            </ul>
            <ul className={s.payments} aria-label="Ödeme yöntemleri">
              {PAYMENTS.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>

          <div className={s.bottom}>
            <p>© {year} ACG TASARIM. Tüm hakları saklıdır.</p>
            <ul className={s.legal}>
              <li>
                <Link to="/sayfa/kvkk">KVKK</Link>
              </li>
              <li>
                <Link to="/sayfa/gizlilik">Gizlilik</Link>
              </li>
              <li>
                <Link to="/sayfa/mesafeli-satis">Mesafeli satış</Link>
              </li>
              <li>
                <Link to="/sayfa/cerez">Çerez politikası</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
