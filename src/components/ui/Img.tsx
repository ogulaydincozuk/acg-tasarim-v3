import { useState } from 'react';
import { BRAND, imageSource, type ImageKey } from '../../data/images';
import { cx } from '../../lib/format';
import s from './Img.module.css';

interface ImgProps {
  image: ImageKey;
  alt: string;
  /** en/boy — kırpılmış srcset üretir ve yer tutucu oranını belirler */
  ratio?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
  maxWidth?: number;
}

/**
 * Tutarlı görsel bileşeni: responsive srcset, tembel yükleme, yumuşak belirme
 * ve görsel yüklenemezse marka yer tutucusu.
 */
export function Img({ image, alt, ratio, sizes = '100vw', priority, className, maxWidth }: ImgProps) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { src, srcSet } = imageSource(image, ratio, maxWidth);

  return (
    <span className={cx(s.frame, className)} style={ratio ? { aspectRatio: String(ratio) } : undefined}>
      {failed ? (
        <span className={s.fallback} role="img" aria-label={alt}>
          <img src={BRAND.badge} alt="" />
        </span>
      ) : (
        <img
          className={cx(s.img, loaded && s.loaded)}
          src={src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          draggable={false}
        />
      )}
    </span>
  );
}
