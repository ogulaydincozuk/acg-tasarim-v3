import { useEffect } from 'react';

const BRAND = 'ACG TASARIM';

export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BRAND}` : `${BRAND} · Kalıp, hammadde ve üretim malzemeleri`;
  }, [title]);
}
