import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Heart, LogOut, Package, ShoppingBag } from 'lucide-react';
import { useAccount } from '../context/AccountContext';
import { useShop } from '../context/ShopContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { cx, formatPrice } from '../lib/format';
import { isEmail, onlyDigits } from '../lib/checkout';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import s from './Account.module.css';

type Tab = 'giris' | 'uye';

const fmtDate = (iso: string) => new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

/** Demo üyelik: giriş / üye ol (şifre saklanmaz, doğrulanmaz) ve üye paneli. */
export function AccountPage() {
  const { user } = useAccount();
  usePageTitle(user ? 'Hesabım' : 'Giriş yap / Üye ol');
  return (
    <div className={cx('container', s.page)}>
      <Breadcrumbs items={[{ label: 'Ana sayfa', to: '/' }, { label: 'Hesabım' }]} />
      {user ? <Dashboard /> : <AuthTabs />}
    </div>
  );
}

function AuthTabs() {
  const [tab, setTab] = useState<Tab>('giris');
  return (
    <div className={s.auth}>
      <header className={s.authHead}>
        <span className="eyebrow">Hesabım</span>
        <h1 className={s.title}>{tab === 'giris' ? 'Giriş yap' : 'Üye ol'}</h1>
        <p className={s.lead}>Siparişlerini takip et, adres ve favorilerini bir arada tut.</p>
      </header>

      <p className="demo-note" role="note">
        <span className="demo-badge">Demo</span>
        <span>Üyelik şu an demo olarak çalışır: bilgilerin yalnızca bu tarayıcıda tutulur, şifren saklanmaz ve doğrulanmaz. Gerçek giriş sonraki aşamada eklenecek.</span>
      </p>

      <div className={s.tabs} role="tablist" aria-label="Hesap işlemi">
        {(['giris', 'uye'] as const).map((t) => (
          <button key={t} type="button" role="tab" id={`tab-${t}`} aria-selected={tab === t} aria-controls={`panel-${t}`} className={cx(s.tab, tab === t && s.tabOn)} onClick={() => setTab(t)}>
            {t === 'giris' ? 'Giriş yap' : 'Üye ol'}
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className={s.authPanel}>
        {tab === 'giris' ? <LoginForm onSwitch={() => setTab('uye')} /> : <RegisterForm onSwitch={() => setTab('giris')} />}
      </div>
    </div>
  );
}

function LoginForm({ onSwitch }: { onSwitch: () => void }) {
  const { login } = useAccount();
  const { notify } = useShop();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isEmail(email)) return setError('Geçerli bir e-posta gir.');
    const res = login(email, password);
    if (!res.ok) return setError(res.error);
    notify({ title: 'Giriş yapıldı (demo)' });
    navigate('/hesap', { replace: true });
  };

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}
      <div className="field">
        <label htmlFor="li-email">E-posta</label>
        <input id="li-email" className="input" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="li-pass">Şifre</label>
        <input id="li-pass" className="input" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <span className="field-hint">Demo: şifre doğrulanmaz, en az 6 karakter yeterli.</span>
      </div>
      <button type="submit" className="btn btn--primary btn--block">
        Giriş yap
      </button>
      <p className={s.switch}>
        Hesabın yok mu?{' '}
        <button type="button" onClick={onSwitch}>
          Üye ol
        </button>
      </p>
    </form>
  );
}

function RegisterForm({ onSwitch }: { onSwitch: () => void }) {
  const { register } = useAccount();
  const { notify } = useShop();
  const navigate = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', consent: false });
  const [error, setError] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (f.name.trim().length < 3) return setError('Ad soyad gir.');
    if (!isEmail(f.email)) return setError('Geçerli bir e-posta gir.');
    if (f.phone && onlyDigits(f.phone).length < 10) return setError('Telefon numarasını 10 haneli gir ya da boş bırak.');
    if (!f.consent) return setError('Devam etmek için KVKK aydınlatma metnini onaylaman gerekiyor.');
    const res = register({ name: f.name, email: f.email, phone: f.phone ? onlyDigits(f.phone) : undefined, password: f.password });
    if (!res.ok) return setError(res.error);
    notify({ title: 'Demo hesabın oluşturuldu' });
    navigate('/hesap', { replace: true });
  };

  return (
    <form className={s.form} onSubmit={submit} noValidate>
      {error && (
        <p className="form-alert" role="alert">
          {error}
        </p>
      )}
      <div className="field">
        <label htmlFor="rg-name">Ad soyad</label>
        <input id="rg-name" className="input" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="rg-email">E-posta</label>
        <input id="rg-email" className="input" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="rg-phone">Telefon (isteğe bağlı)</label>
        <input id="rg-phone" className="input" type="tel" inputMode="tel" autoComplete="tel" placeholder="05xx xxx xx xx" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} />
      </div>
      <div className="field">
        <label htmlFor="rg-pass">Şifre</label>
        <input id="rg-pass" className="input" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <span className="field-hint">Demo: en az 6 karakter. Şifre saklanmaz.</span>
      </div>
      <label className="check">
        <input type="checkbox" checked={f.consent} onChange={(e) => setF({ ...f, consent: e.target.checked })} />
        <span>
          <Link to="/sayfa/kvkk" target="_blank">
            KVKK aydınlatma metnini
          </Link>{' '}
          okudum, onaylıyorum.
        </span>
      </label>
      <button type="submit" className="btn btn--primary btn--block">
        Üye ol
      </button>
      <p className={s.switch}>
        Zaten hesabın var mı?{' '}
        <button type="button" onClick={onSwitch}>
          Giriş yap
        </button>
      </p>
    </form>
  );
}

function Dashboard() {
  const { user, myOrders, logout } = useAccount();
  const { favorites, cartCount, notify } = useShop();
  if (!user) return null;
  const first = user.name.split(' ')[0];

  return (
    <div className={s.dash}>
      <header className={s.dashHead}>
        <div className={s.hello}>
          <span className={s.avatar} aria-hidden="true">
            {first.charAt(0).toLocaleUpperCase('tr-TR')}
          </span>
          <div>
            <span className="eyebrow">Hesabım</span>
            <h1 className={s.title}>Merhaba, {first}</h1>
          </div>
        </div>
        <button
          type="button"
          className="btn btn--secondary btn--sm"
          onClick={() => {
            logout();
            notify({ title: 'Çıkış yapıldı' });
          }}
        >
          <LogOut aria-hidden="true" />
          Çıkış yap
        </button>
      </header>

      <p className="demo-note" role="note">
        <span className="demo-badge">Demo</span>
        <span>Bu hesap demo olarak çalışır; bilgilerin yalnızca bu tarayıcıda tutulur.</span>
      </p>

      <div className={s.dashGrid}>
        <section className={s.panel} aria-labelledby="acc-info">
          <h2 id="acc-info" className={s.panelTitle}>
            Hesap bilgileri
          </h2>
          <dl className={s.info}>
            <div>
              <dt>Ad soyad</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{user.email}</dd>
            </div>
            {user.phone && (
              <div>
                <dt>Telefon</dt>
                <dd>{user.phone}</dd>
              </div>
            )}
            <div>
              <dt>Üyelik tarihi</dt>
              <dd>{fmtDate(user.createdAt)}</dd>
            </div>
          </dl>
          <ul className={s.shortcuts}>
            <li>
              <Link to="/favoriler">
                <span className={s.shortcutIcon}>
                  <Heart aria-hidden="true" strokeWidth={1.8} />
                </span>
                Favorilerim <span className={s.shortcutCount}>{favorites.length}</span>
              </Link>
            </li>
            <li>
              <Link to="/odeme">
                <span className={s.shortcutIcon}>
                  <ShoppingBag aria-hidden="true" strokeWidth={1.8} />
                </span>
                Sepetim <span className={s.shortcutCount}>{cartCount}</span>
              </Link>
            </li>
          </ul>
        </section>

        <section className={s.panel} aria-labelledby="acc-orders">
          <h2 id="acc-orders" className={s.panelTitle}>
            Siparişlerim
          </h2>
          {myOrders.length ? (
            <ul className={s.orders}>
              {myOrders.map((o) => (
                <li key={o.no}>
                  <Link to={`/siparis/${o.no}`} className={s.order}>
                    <span className={s.orderMain}>
                      <strong>{o.no}</strong>
                      <small>
                        {fmtDate(o.createdAt)} · {o.lines.reduce((n, l) => n + l.qty, 0)} ürün
                      </small>
                    </span>
                    <span className={s.orderSide}>
                      <span className={s.orderPrice}>{formatPrice(o.total)}</span>
                      <span className={s.status}>{o.status}</span>
                    </span>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className={s.noOrders}>
              <span className={s.noOrdersIcon}>
                <Package strokeWidth={1.6} aria-hidden="true" />
              </span>
              <p>Henüz siparişin yok.</p>
              <Link to="/kategori/yilbasi" className="text-link">
                Yılbaşı koleksiyonuna göz at
                <ArrowRight aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
