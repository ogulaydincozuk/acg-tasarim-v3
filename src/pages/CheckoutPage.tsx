import { useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CreditCard, Landmark, Lock, ShoppingBag } from 'lucide-react';
import { STORE } from '../data/content';
import { PRODUCT_BY_ID } from '../data/products';
import { useShop } from '../context/ShopContext';
import { useAccount, type OrderLine } from '../context/AccountContext';
import { usePageTitle } from '../hooks/usePageTitle';
import { cx, formatPrice } from '../lib/format';
import { formatCardNumber, formatExpiry, isEmail, isValidExpiry, onlyDigits, orderTotals } from '../lib/checkout';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Img } from '../components/ui/Img';
import s from './Checkout.module.css';

type Payment = 'kart' | 'havale';

interface FormState {
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  note: string;
  payment: Payment;
  cardNumber: string;
  cardName: string;
  expiry: string;
  cvc: string;
  consent: boolean;
}

type Errors = Partial<Record<keyof FormState, string>>;

/** Stripe'ın herkese açık test kartı: gerçek bir kart değildir. */
const DEMO_CARD = { cardNumber: '4242 4242 4242 4242', cardName: 'DEMO MÜŞTERİ', expiry: '12/30', cvc: '123' };

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 3) e.name = 'Ad soyad gir.';
  if (!isEmail(f.email)) e.email = 'Geçerli bir e-posta gir.';
  if (onlyDigits(f.phone).length < 10) e.phone = 'Telefon numarasını 10 haneli gir.';
  if (f.city.trim().length < 2) e.city = 'İl gir.';
  if (f.district.trim().length < 2) e.district = 'İlçe gir.';
  if (f.address.trim().length < 8) e.address = 'Açık adresini gir.';
  if (f.payment === 'kart') {
    const n = onlyDigits(f.cardNumber);
    if (n.length < 13 || n.length > 19) e.cardNumber = 'Kart numarası 13–19 haneli olmalı.';
    if (f.cardName.trim().length < 3) e.cardName = 'Kart üzerindeki adı gir.';
    if (!isValidExpiry(f.expiry)) e.expiry = 'AA/YY biçiminde geçerli bir tarih gir.';
    if (!/^\d{3,4}$/.test(f.cvc)) e.cvc = '3 veya 4 haneli güvenlik kodu gir.';
  }
  if (!f.consent) e.consent = 'Devam etmek için sözleşmeyi onaylaman gerekiyor.';
  return e;
}

export function CheckoutPage() {
  usePageTitle('Ödeme');
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useShop();
  const { user, placeOrder } = useAccount();
  const totals = orderTotals(cartTotal);

  const lines = useMemo(
    () => cart.map((l) => ({ qty: l.qty, p: PRODUCT_BY_ID.get(l.id) })).filter((x): x is { qty: number; p: NonNullable<typeof x.p> } => Boolean(x.p)),
    [cart],
  );

  const [f, setF] = useState<FormState>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    city: '',
    district: '',
    address: '',
    note: '',
    payment: 'kart',
    cardNumber: '',
    cardName: '',
    expiry: '',
    cvc: '',
    consent: false,
  });
  const [errors, setErrors] = useState<Errors>({});
  const [processing, setProcessing] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };
  const onText = (key: keyof FormState, fmt?: (v: string) => string) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    set(key, (fmt ? fmt(e.target.value) : e.target.value) as never);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (processing) return;
    const next = validate(f);
    setErrors(next);
    const firstKey = Object.keys(next)[0];
    if (firstKey) {
      formRef.current?.querySelector<HTMLElement>(`[name="${firstKey}"]`)?.focus();
      return;
    }
    setProcessing(true);
    // Demo ödeme: gerçek bir tahsilat yapılmaz; 3D Secure benzeri kısa bir bekleme gösterilir.
    window.setTimeout(() => {
      const orderLines: OrderLine[] = lines.map(({ p, qty }) => ({ id: p.id, slug: p.slug, name: p.name, image: p.image, price: p.price, qty }));
      const order = placeOrder({
        lines: orderLines,
        contact: { name: f.name.trim(), email: f.email.trim(), phone: onlyDigits(f.phone) },
        address: { city: f.city.trim(), district: f.district.trim(), line: f.address.trim(), note: f.note.trim() || undefined },
        payment: f.payment,
        cardLast4: f.payment === 'kart' ? onlyDigits(f.cardNumber).slice(-4) : undefined,
      });
      navigate(`/siparis/${order.no}`, { replace: true });
      clearCart();
    }, 1400);
  };

  const crumbs = [{ label: 'Ana sayfa', to: '/' }, { label: 'Ödeme' }];

  if (!lines.length && !processing) {
    return (
      <div className={cx('container', s.page)}>
        <Breadcrumbs items={crumbs} />
        <div className={s.empty}>
          <span className={s.emptyIcon}>
            <ShoppingBag strokeWidth={1.6} aria-hidden="true" />
          </span>
          <h1 className={s.emptyTitle}>Sepetin boş</h1>
          <p>Ödemeye geçmek için önce sepetine ürün ekle.</p>
          <Link to="/kategori/yilbasi" className="btn btn--primary">
            Yılbaşı koleksiyonu
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const err = (key: keyof FormState) => (errors[key] ? { 'aria-invalid': true as const, 'aria-describedby': `err-${key}` } : {});
  const ErrText = ({ k }: { k: keyof FormState }) =>
    errors[k] ? (
      <span id={`err-${k}`} className="field-error" role="alert">
        {errors[k]}
      </span>
    ) : null;

  return (
    <div className={cx('container', s.page)}>
      <Breadcrumbs items={crumbs} />
      <header className={s.head}>
        <h1 className={s.title}>Ödeme</h1>
        <span className="demo-badge">Demo</span>
      </header>

      <div className="demo-note" role="note">
        <span className="demo-badge">Demo</span>
        <p>Bu ödeme adımı demo olarak çalışır: gerçek tahsilat yapılmaz, kart bilgileri kaydedilmez. İstersen aşağıdaki test kartını otomatik doldurabilirsin.</p>
      </div>

      <form ref={formRef} className={s.layout} onSubmit={submit} noValidate>
        <div className={s.main}>
          {Object.values(errors).some(Boolean) && (
            <p className="form-alert" role="alert">
              Lütfen işaretli alanları kontrol et.
            </p>
          )}

          <section className={s.block} aria-labelledby="co-contact">
            <h2 id="co-contact" className={s.blockTitle}>
              <span className={s.step}>1</span> İletişim
              {!user && (
                <Link to="/hesap" className={s.blockLink}>
                  Üye misin? Giriş yap
                </Link>
              )}
            </h2>
            <div className="form-grid">
              <div className="field span-2">
                <label htmlFor="co-name">Ad soyad</label>
                <input id="co-name" name="name" className="input" autoComplete="name" value={f.name} onChange={onText('name')} {...err('name')} />
                <ErrText k="name" />
              </div>
              <div className="field">
                <label htmlFor="co-email">E-posta</label>
                <input id="co-email" name="email" type="email" className="input" autoComplete="email" value={f.email} onChange={onText('email')} {...err('email')} />
                <ErrText k="email" />
              </div>
              <div className="field">
                <label htmlFor="co-phone">Telefon</label>
                <input id="co-phone" name="phone" type="tel" inputMode="tel" className="input" autoComplete="tel" placeholder="05xx xxx xx xx" value={f.phone} onChange={onText('phone')} {...err('phone')} />
                <ErrText k="phone" />
              </div>
            </div>
          </section>

          <section className={s.block} aria-labelledby="co-address">
            <h2 id="co-address" className={s.blockTitle}>
              <span className={s.step}>2</span> Teslimat adresi
            </h2>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="co-city">İl</label>
                <input id="co-city" name="city" className="input" autoComplete="address-level1" value={f.city} onChange={onText('city')} {...err('city')} />
                <ErrText k="city" />
              </div>
              <div className="field">
                <label htmlFor="co-district">İlçe</label>
                <input id="co-district" name="district" className="input" autoComplete="address-level2" value={f.district} onChange={onText('district')} {...err('district')} />
                <ErrText k="district" />
              </div>
              <div className="field span-2">
                <label htmlFor="co-address-line">Açık adres</label>
                <textarea id="co-address-line" name="address" className="input" autoComplete="street-address" rows={3} value={f.address} onChange={onText('address')} {...err('address')} />
                <ErrText k="address" />
              </div>
              <div className="field span-2">
                <label htmlFor="co-note">Sipariş notu (isteğe bağlı)</label>
                <input id="co-note" name="note" className="input" value={f.note} onChange={onText('note')} />
              </div>
            </div>
          </section>

          <section className={s.block} aria-labelledby="co-pay">
            <h2 id="co-pay" className={s.blockTitle}>
              <span className={s.step}>3</span> Ödeme
              <Lock className={s.lock} aria-hidden="true" strokeWidth={1.8} />
            </h2>

            <div className={s.methods} role="radiogroup" aria-label="Ödeme yöntemi">
              <label className={cx(s.method, f.payment === 'kart' && s.methodOn)}>
                <input type="radio" name="payment" value="kart" checked={f.payment === 'kart'} onChange={() => set('payment', 'kart')} />
                <span className={s.methodIcon}>
                  <CreditCard aria-hidden="true" strokeWidth={1.7} />
                </span>
                <span className={s.methodText}>
                  <strong>Kredi / banka kartı</strong>
                  <small>Demo · 3D Secure simülasyonu</small>
                </span>
              </label>
              <label className={cx(s.method, f.payment === 'havale' && s.methodOn)}>
                <input type="radio" name="payment" value="havale" checked={f.payment === 'havale'} onChange={() => set('payment', 'havale')} />
                <span className={s.methodIcon}>
                  <Landmark aria-hidden="true" strokeWidth={1.7} />
                </span>
                <span className={s.methodText}>
                  <strong>Havale / EFT</strong>
                  <small>Demo · IBAN bilgisi sipariş sonrası</small>
                </span>
              </label>
            </div>

            {f.payment === 'kart' ? (
              <div className={s.card}>
                <div className="form-grid">
                  <div className="field span-2">
                    <label htmlFor="co-card">Kart numarası</label>
                    <input
                      id="co-card"
                      name="cardNumber"
                      className="input"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="0000 0000 0000 0000"
                      value={f.cardNumber}
                      onChange={onText('cardNumber', formatCardNumber)}
                      {...err('cardNumber')}
                    />
                    <ErrText k="cardNumber" />
                  </div>
                  <div className="field span-2">
                    <label htmlFor="co-card-name">Kart üzerindeki ad</label>
                    <input id="co-card-name" name="cardName" className="input" autoComplete="off" value={f.cardName} onChange={onText('cardName')} {...err('cardName')} />
                    <ErrText k="cardName" />
                  </div>
                  <div className="field">
                    <label htmlFor="co-exp">Son kullanma</label>
                    <input id="co-exp" name="expiry" className="input" inputMode="numeric" autoComplete="off" placeholder="AA/YY" value={f.expiry} onChange={onText('expiry', formatExpiry)} {...err('expiry')} />
                    <ErrText k="expiry" />
                  </div>
                  <div className="field">
                    <label htmlFor="co-cvc">Güvenlik kodu</label>
                    <input
                      id="co-cvc"
                      name="cvc"
                      className="input"
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="CVC"
                      maxLength={4}
                      value={f.cvc}
                      onChange={onText('cvc', (v) => onlyDigits(v).slice(0, 4))}
                      {...err('cvc')}
                    />
                    <ErrText k="cvc" />
                  </div>
                </div>
                <button
                  type="button"
                  className={s.fill}
                  onClick={() => {
                    setF((prev) => ({ ...prev, ...DEMO_CARD }));
                    setErrors((prev) => ({ ...prev, cardNumber: undefined, cardName: undefined, expiry: undefined, cvc: undefined }));
                  }}
                >
                  Demo test kartını doldur
                </button>
              </div>
            ) : (
              <p className={s.transfer}>Siparişi onayladıktan sonra demo IBAN bilgisi sipariş özetinde gösterilir. Gerçek bir havale yapılmaz.</p>
            )}
          </section>

          <div className={cx('field', s.consent)}>
            <label className="check">
              <input type="checkbox" name="consent" checked={f.consent} onChange={(e) => set('consent', e.target.checked)} aria-invalid={Boolean(errors.consent)} />
              <span>
                <Link to="/sayfa/mesafeli-satis" target="_blank">
                  Mesafeli satış sözleşmesini
                </Link>{' '}
                ve{' '}
                <Link to="/sayfa/kvkk" target="_blank">
                  KVKK aydınlatma metnini
                </Link>{' '}
                okudum, onaylıyorum.
              </span>
            </label>
            <ErrText k="consent" />
          </div>
        </div>

        <aside className={s.summary} aria-label="Sipariş özeti">
          <h2 className={s.summaryTitle}>Sipariş özeti</h2>
          <ul className={s.lines}>
            {lines.map(({ p, qty }) => (
              <li key={p.id} className={s.line}>
                <span className={s.thumbWrap}>
                  <Img image={p.image} alt="" ratio={1} sizes="64px" maxWidth={320} className={s.thumb} />
                  <span className={s.qty}>{qty}</span>
                </span>
                <span className={s.lineName}>{p.name}</span>
                <span className="price">{formatPrice(p.price * qty)}</span>
              </li>
            ))}
          </ul>
          <dl className={s.totals}>
            <div>
              <dt>Ara toplam</dt>
              <dd className="price">{formatPrice(totals.subtotal)}</dd>
            </div>
            <div>
              <dt>Kargo</dt>
              <dd className="price">{totals.shipping === 0 ? 'Ücretsiz' : formatPrice(totals.shipping)}</dd>
            </div>
            <div className={s.grand}>
              <dt>Toplam</dt>
              <dd className="price">{formatPrice(totals.total)}</dd>
            </div>
          </dl>
          {totals.shipping > 0 && (
            <p className={s.shipNote}>
              {formatPrice(STORE.freeShippingThreshold - totals.subtotal)} daha ekleyerek ücretsiz kargodan yararlanabilirsin.
            </p>
          )}
          <button type="submit" className="btn btn--primary btn--block" disabled={processing}>
            {processing ? 'Ödeme onaylanıyor…' : `Siparişi onayla · ${formatPrice(totals.total)}`}
          </button>
          <p className={s.fine}>KDV dahildir. Demo modunda hiçbir tahsilat yapılmaz.</p>
        </aside>
      </form>
    </div>
  );
}
