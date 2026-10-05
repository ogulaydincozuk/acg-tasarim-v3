import { useEffect, useRef, useState } from 'react';
import type { ImageKey } from '../../data/images';
import { cx } from '../../lib/format';
import { Img } from '../ui/Img';
import s from './Gallery.module.css';

/** Tek kaydırma izi: masaüstünde küçük resimlerle, mobilde parmakla gezilir. */
export function Gallery({ images, name }: { images: ImageKey[]; name: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: 0 });
    setIndex(0);
    const onScroll = () => setIndex(Math.round(el.scrollLeft / el.clientWidth));
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [images]);

  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className={s.gallery}>
      <div className={s.thumbs} role="tablist" aria-label="Ürün görselleri">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Görsel ${i + 1} / ${images.length}`}
            className={cx(s.thumb, i === index && s.thumbActive)}
            onClick={() => go(i)}
          >
            <Img image={img} alt="" ratio={1} sizes="76px" maxWidth={320} />
          </button>
        ))}
      </div>
      <div className={s.stage}>
        <div ref={track} className={cx(s.track, 'no-scrollbar')} tabIndex={0} aria-label={`${name} görselleri, kaydırarak gezin`}>
          {images.map((img, i) => (
            <div key={img} className={s.slide}>
              <Img
                image={img}
                alt={i === 0 ? name : `${name} — görsel ${i + 1}`}
                ratio={4 / 5}
                sizes="(min-width: 1024px) 46vw, 100vw"
                priority={i === 0}
                maxWidth={1400}
              />
            </div>
          ))}
        </div>
        <div className={s.dots} aria-hidden="true">
          {images.map((img, i) => (
            <span key={img} className={cx(s.dot, i === index && s.dotActive)} />
          ))}
        </div>
        <span className={s.counter} aria-hidden="true">
          {index + 1} / {images.length}
        </span>
      </div>
    </div>
  );
}
