import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import type { ImageKey } from '../data/images';
import { XMAS_PRODUCTS } from '../data/products';
import { Img } from '../components/ui/Img';
import { useMediaQuery } from '../hooks/useUi';
import { cx } from '../lib/format';
import s from './HeroSlider.module.css';

/** Slayt başına gösterim süresi (ms) */
const INTERVAL = 6500;

interface Slide {
  id: string;
  image: ImageKey;
  alt: string;
  chip: string;
  title: [string, string];
  text: string;
  meta?: string;
  cta: { label: string; to: string };
  ghost?: { label: string; to: string };
}

/** Ocak ayında içinde bulunulan yıla, diğer aylarda yaklaşan yeni yıla göre hesaplanır. */
function newYearInfo(now = new Date()) {
  const inJanuary = now.getMonth() === 0;
  const year = inJanuary ? now.getFullYear() : now.getFullYear() + 1;
  const days = Math.ceil((new Date(year, 0, 1).getTime() - now.getTime()) / 86_400_000);
  return { year, days: inJanuary ? 0 : days };
}

/**
 * Hero slider: yuvarlak köşeli büyük banner, solda koyu degrade üzerinde başlık + hap CTA.
 * Slaytlar yalnızca burada tanımlanır (yeni kampanya için `slides` listesine bir öğe eklemek yeter).
 * Otomatik geçiş: üzerine gelince/odaklanınca, duraklatılınca ve "hareketi azalt" tercihinde durur.
 */
export function HeroSlider() {
  const { year, days } = newYearInfo();
  const slides = useMemo<Slide[]>(
    () => [
      {
        id: 'yilbasi',
        image: 'xmasHeroGifts',
        alt: 'Hediye paketleri, tarçın çubukları ve şekerlemelerle hazırlanmış yılbaşı masası',
        chip: `Yılbaşı Koleksiyonu · ${year}`,
        title: ['Yılbaşını kendi ellerinle', 'ışıl ışıl yap.'],
        text: 'Noel Baba, çam ağacı, kardan adam ve mumluk ev kalıpları; esanslar ve hediye setleri tek koleksiyonda.',
        meta: `${days > 0 ? `Yeni yıla ${days} gün kaldı` : 'Mutlu yıllar'} · ${XMAS_PRODUCTS.length} yeni sezon ürünü`,
        cta: { label: 'Yılbaşı Koleksiyonunu Keşfet', to: '/kategori/yilbasi' },
        ghost: { label: 'Tüm Ürünler', to: '/kategori/kaliplar' },
      },
      {
        id: 'kaliplar',
        image: 'siliconeMoldPink',
        alt: 'Pembe silikon kalıp',
        chip: 'Silikon Kalıplar',
        title: ['Doğru kalıp,', 'kusursuz döküm.'],
        text: 'Mum, kokulu taş ve dekorasyon için silikon kalıplar; geometrik, botanik ve figürlü modeller tek koleksiyonda.',
        cta: { label: 'Kalıpları Keşfet', to: '/kategori/kaliplar' },
        ghost: { label: 'Yeni Gelenler', to: '/kategori/yeni-gelenler' },
      },
      {
        id: 'setler',
        image: 'candleJarsPeach',
        alt: 'Şeftali tonlu cam kavanozlarda dökülmüş mumlar',
        chip: 'Başlangıç Setleri',
        title: ['İlk üretimin için', 'her şey tek kutuda.'],
        text: 'Kalıp, hammadde ve esans bir arada: mum, kokulu taş, dekorasyon ve boyama başlangıç setleri.',
        cta: { label: 'Setleri İncele', to: '/kategori/setler' },
        ghost: { label: 'Kampanyalar', to: '/kategori/kampanyalar' },
      },
    ],
    [year, days],
  );

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const [focusIn, setFocusIn] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const running = !userPaused && !reduced && !hover && !focusIn;
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false); // kaydırma bir bağlantı üzerinde bitince tıklama sayılmasın

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  // Her slayt değişiminde (elle de olsa) süre baştan başlar
  useEffect(() => {
    if (!running) return;
    const t = window.setTimeout(() => go(index + 1), INTERVAL);
    return () => window.clearTimeout(t);
  }, [running, index, go]);

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      swiped.current = true;
      window.setTimeout(() => (swiped.current = false), 350); // yalnızca hemen ardından gelen tıklamayı yut
      go(index + (dx < 0 ? 1 : -1));
    }
  };
  const onClickCapture = (e: MouseEvent) => {
    if (!swiped.current) return;
    swiped.current = false;
    e.preventDefault();
    e.stopPropagation();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
  };

  return (
    <section
      className={s.hero}
      aria-roledescription="carousel"
      aria-label="Koleksiyonlar ve kampanyalar"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setFocusIn(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFocusIn(false);
      }}
      onKeyDown={onKeyDown}
    >
      <h1 className="visually-hidden">ACG TASARIM · Kalıp, hammadde ve üretim malzemeleri</h1>

      <div className="container">
        <div className={s.stage} onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (swipe.current = null)} onClickCapture={onClickCapture}>
          <div className={s.frame}>
            <div className={s.slides} aria-live={running ? 'off' : 'polite'}>
              {slides.map((slide, i) => {
                const active = i === index;
                return (
                  <div
                    key={slide.id}
                    className={cx(s.slide, active && s.active)}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${i + 1} / ${count}`}
                    aria-hidden={!active}
                    inert={!active}
                  >
                    <div className={s.bg}>
                      <Img
                        image={slide.image}
                        alt={slide.alt}
                        ratio={16 / 7}
                        sizes="(min-width: 1440px) 1400px, 100vw"
                        maxWidth={1400}
                        priority={i === 0}
                        className={s.bgImg}
                      />
                    </div>
                    <div className={s.shade} aria-hidden="true" />

                    <div className={s.content}>
                      <span className={s.chip}>{slide.chip}</span>
                      <h2 className={s.title}>
                        {slide.title[0]}
                        <br />
                        {slide.title[1]}
                      </h2>
                      <p className={s.text}>{slide.text}</p>
                      <div className={s.ctas}>
                        <Link to={slide.cta.to} className="btn btn--soft">
                          {slide.cta.label}
                          <ArrowRight aria-hidden="true" />
                        </Link>
                        {slide.ghost && (
                          <Link to={slide.ghost.to} className={s.ghost}>
                            {slide.ghost.label}
                          </Link>
                        )}
                      </div>
                      {slide.meta && <p className={s.meta}>{slide.meta}</p>}
                    </div>
                  </div>
                );
              })}
            </div>

            <button type="button" className={cx(s.arrow, s.prev)} onClick={() => go(index - 1)} aria-label="Önceki slayt">
              <ChevronLeft strokeWidth={1.8} aria-hidden="true" />
            </button>
            <button type="button" className={cx(s.arrow, s.next)} onClick={() => go(index + 1)} aria-label="Sonraki slayt">
              <ChevronRight strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={s.controls}>
          <ul className={s.dots} aria-label="Slayt seçimi">
            {slides.map((slide, i) => (
              <li key={slide.id}>
                <button
                  type="button"
                  className={s.dotBtn}
                  aria-label={`${i + 1}. slayt: ${slide.chip}`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                >
                  <span className={s.dot}>{i === index && <span key={running ? 'run' : 'idle'} className={cx(s.fill, running && s.filling)} />}</span>
                </button>
              </li>
            ))}
          </ul>
          {!reduced && (
            <button type="button" className={s.pause} onClick={() => setUserPaused((v) => !v)} aria-label={userPaused ? 'Otomatik geçişi başlat' : 'Otomatik geçişi durdur'}>
              {userPaused ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
