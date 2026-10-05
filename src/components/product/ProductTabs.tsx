import { useEffect, useId, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Check, ChevronDown, PenLine, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { STORE, USE_CASES } from '../../data/content';
import { MOLD_CARE } from '../../data/products';
import { USAGE_LABEL } from '../../data/taxonomy';
import type { Product } from '../../data/types';
import { useMediaQuery } from '../../hooks/useUi';
import { cx, formatCount } from '../../lib/format';
import { Stars } from './ProductBits';
import s from './ProductTabs.module.css';

function SpecTable({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl className={s.table}>
      {rows.map((r) => (
        <div key={r.label}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Puan dağılımı — mock veri: ortalama puandan türetilir */
function distribution(rating: number) {
  const p5 = Math.min(0.95, Math.max(0.3, (rating - 4) * 0.95 + 0.06));
  const p4 = (1 - p5) * 0.7;
  const p3 = (1 - p5 - p4) * 0.6;
  const p2 = (1 - p5 - p4 - p3) * 0.5;
  const p1 = 1 - p5 - p4 - p3 - p2;
  return [p5, p4, p3, p2, p1];
}

function Reviews({ product: p }: { product: Product }) {
  const dist = distribution(p.rating);
  return (
    <div className={s.reviews}>
      <div className={s.summary}>
        <p className={s.avg}>{p.rating.toFixed(1).replace('.', ',')}</p>
        <Stars value={p.rating} />
        <p className={s.avgNote}>{formatCount(p.reviewCount)} değerlendirme</p>
        <ul className={s.bars}>
          {dist.map((v, i) => (
            <li key={i}>
              <span>{5 - i}</span>
              <span className={s.bar}>
                <span style={{ width: `${v * 100}%` }} />
              </span>
              <span className={s.barPct}>%{Math.round(v * 100)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className={s.reviewList}>
        {/* PLACEHOLDER: Gerçek yorum sistemi V2'de; isim veya yorum metni uydurulmaz. */}
        {[0, 1].map((i) => (
          <article key={i} className={s.reviewCard}>
            <div className={s.reviewHead}>
              <span className={s.avatar} aria-hidden="true" />
              <div>
                <p className={s.reviewer}>Doğrulanmış alıcı</p>
                <Stars value={5} />
              </div>
            </div>
            <p className={s.reviewPlaceholder}>
              Örnek yorum alanı — gerçek müşteri yorumları, sipariş sonrası doğrulanmış alıcılardan toplanarak burada listelenecek.
            </p>
          </article>
        ))}
        <button type="button" className="btn btn--secondary btn--md" disabled title="Yorum sistemi V2'de aktif olacak">
          <PenLine aria-hidden="true" />
          Yorum yaz
        </button>
      </div>
    </div>
  );
}

/** request: dışarıdan bir sekmeyi açmak için (ör. puan bağlantısı → Yorumlar) */
export function ProductTabs({ product: p, request }: { product: Product; request?: { id: string; at: number } }) {
  const isMold = p.category === 'kaliplar';
  const sections: { id: string; label: string; content: ReactNode }[] = [
    {
      id: 'aciklama',
      label: 'Açıklama',
      content: (
        <div className={s.bento}>
          <div className={cx(s.card, s.prose)}>
            <p>{p.description}</p>
          </div>
          {p.contents && (
            <div className={cx(s.card, s.cardTint)}>
              <h3>Set içeriği</h3>
              <ul className={s.checks}>
                {p.contents.map((c) => (
                  <li key={c}>
                    <Check aria-hidden="true" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {isMold && (
            <div className={cx(s.card, s.cardTint)}>
              <h3>Bakım</h3>
              <p>{MOLD_CARE}</p>
            </div>
          )}
        </div>
      ),
    },
    { id: 'ozellikler', label: 'Özellikler', content: <SpecTable rows={[{ label: 'Ürün kodu', value: p.sku }, ...p.specs]} /> },
    {
      id: 'olculer',
      label: 'Ölçüler',
      content: (
        <>
          <SpecTable rows={p.dimensions} />
          <p className={s.note}>Ölçüler ±2 mm tolerans içerebilir.</p>
        </>
      ),
    },
    {
      id: 'kullanim',
      label: 'Kullanım alanları',
      content: (
        <ul className={s.usages}>
          {p.usage.map((u) => (
            <li key={u}>
              <p className={s.usageName}>{USAGE_LABEL[u]}</p>
              <p className={s.usageText}>{USE_CASES[u].summary}</p>
              <Link to={`/kategori/${u}`} className="text-link">
                {USAGE_LABEL[u]} ürünleri
              </Link>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: 'kargo',
      label: 'Kargo & iade',
      content: (
        <ul className={s.service}>
          <li>
            <Truck strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p>Kargo</p>
              <span>
                {STORE.shippingNote} {new Intl.NumberFormat('tr-TR').format(STORE.freeShippingThreshold)} TL ve üzeri siparişlerde kargo ücretsiz.
              </span>
            </div>
          </li>
          <li>
            <RotateCcw strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p>İade</p>
              <span>{STORE.returnNote}</span>
            </div>
          </li>
          <li>
            <ShieldCheck strokeWidth={1.5} aria-hidden="true" />
            <div>
              <p>Güvenli ödeme</p>
              <span>Kart bilgilerin 3D Secure ve SSL ile korunur.</span>
            </div>
          </li>
        </ul>
      ),
    },
    { id: 'yorumlar', label: `Yorumlar (${formatCount(p.reviewCount)})`, content: <Reviews product={p} /> },
  ];

  const mobile = useMediaQuery('(max-width: 767px)');
  const [active, setActive] = useState(sections[0].id);
  const [openSet, setOpenSet] = useState<string[]>([sections[0].id]);
  const uid = useId();

  useEffect(() => {
    if (!request) return;
    setActive(request.id);
    setOpenSet((ids) => (ids.includes(request.id) ? ids : [...ids, request.id]));
  }, [request]);

  if (mobile) {
    return (
      <div className={s.accordion} id="detaylar">
        {sections.map((sec) => {
          const open = openSet.includes(sec.id);
          return (
            <section key={sec.id} id={sec.id === 'yorumlar' ? 'yorumlar' : undefined} className={s.accItem}>
              <h2>
                <button
                  type="button"
                  aria-expanded={open}
                  aria-controls={`${uid}-${sec.id}`}
                  className={s.accTrigger}
                  onClick={() => setOpenSet((ids) => (open ? ids.filter((x) => x !== sec.id) : [...ids, sec.id]))}
                >
                  {sec.label}
                  <ChevronDown aria-hidden="true" />
                </button>
              </h2>
              <div id={`${uid}-${sec.id}`} hidden={!open} className={s.accPanel}>
                {sec.content}
              </div>
            </section>
          );
        })}
      </div>
    );
  }

  return (
    <div className={s.tabs} id="detaylar">
      <div role="tablist" aria-label="Ürün bilgileri" className={cx(s.tablist, 'no-scrollbar')}>
        {sections.map((sec, i) => (
          <button
            key={sec.id}
            type="button"
            role="tab"
            id={`${uid}-tab-${sec.id}`}
            aria-selected={active === sec.id}
            aria-controls={`${uid}-panel-${sec.id}`}
            tabIndex={active === sec.id ? 0 : -1}
            className={cx(s.tab, active === sec.id && s.tabActive)}
            onClick={() => setActive(sec.id)}
            onKeyDown={(e) => {
              const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
              if (!dir) return;
              const next = sections[(i + dir + sections.length) % sections.length];
              setActive(next.id);
              document.getElementById(`${uid}-tab-${next.id}`)?.focus();
            }}
          >
            {sec.label}
          </button>
        ))}
      </div>
      {sections.map((sec) => (
        <div
          key={sec.id}
          id={`${uid}-panel-${sec.id}`}
          role="tabpanel"
          aria-labelledby={`${uid}-tab-${sec.id}`}
          hidden={active !== sec.id}
          className={s.panel}
          tabIndex={0}
        >
          {sec.content}
        </div>
      ))}
    </div>
  );
}
