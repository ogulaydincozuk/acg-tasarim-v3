import { useEffect, useRef, useState, type RefObject } from 'react';

/* Birden çok katman aynı anda açık olabildiği için kilit sayaçla tutulur. */
let lockCount = 0;

/** İçinde gerçekten kaydırılabilen bir ata varsa (diyalog gövdesi, görsel şeridi) dokunma hareketine izin verir. */
function insideScrollable(start: EventTarget | null) {
  let el = start instanceof HTMLElement ? start : null;
  while (el && el !== document.body) {
    const cs = getComputedStyle(el);
    const y = /(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight;
    const x = /(auto|scroll)/.test(cs.overflowX) && el.scrollWidth > el.clientWidth;
    if (y || x) return true;
    el = el.parentElement;
  }
  return false;
}

/* iOS/Safari ve dokunmatikte `overflow: hidden` tek başına arka sayfanın kaymasını engellemez;
   katman dışındaki dokunma hareketi ve tekerlek kaydırması burada durdurulur. */
const blockTouchScroll = (e: TouchEvent) => {
  if (!insideScrollable(e.target)) e.preventDefault();
};
const blockWheelScroll = (e: WheelEvent) => {
  if (!insideScrollable(e.target)) e.preventDefault();
};

export function useBodyLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lockCount += 1;
    if (lockCount === 1) {
      const scrollbar = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = scrollbar > 0 ? `${scrollbar}px` : '';
      document.body.classList.add('is-locked');
      document.documentElement.classList.add('is-locked');
      document.addEventListener('touchmove', blockTouchScroll, { passive: false });
      document.addEventListener('wheel', blockWheelScroll, { passive: false });
    }
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.classList.remove('is-locked');
        document.documentElement.classList.remove('is-locked');
        document.body.style.paddingRight = '';
        document.removeEventListener('touchmove', blockTouchScroll);
        document.removeEventListener('wheel', blockWheelScroll);
      }
    };
  }, [active]);
}

export function useMediaQuery(query: string) {
  const get = () => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return matches;
}

export type DockState = 'hidden' | 'compact' | 'expanded';

/**
 * V3 header kaydırma davranışı. Üç katmanlı tam header sayfa akışında kalır (yapışmaz);
 * ilk ekran geçilince yalnızca compact "dock" görünür.
 * - aşağı kaydırırken: compact (menü · logo · ara + sepet)
 * - yukarı kaydırırken (kısa bir eşikten sonra): kategori rail'i ile tekrar genişler
 * - sayfanın başına dönünce: dock kaybolur, tam header yerinde durur
 * Küçük titremeler yön değiştirmesin diye yön, son dönüş noktasından ölçülür.
 */
export function useHeaderDock(shell: RefObject<HTMLElement | null>, expandAfter = 56) {
  const [state, setState] = useState<DockState>('hidden');
  useEffect(() => {
    let shellH = shell.current?.offsetHeight ?? 0;
    let last = window.scrollY;
    let anchor = last;
    let dir = 0;
    let current: DockState = last > shellH ? 'compact' : 'hidden';
    setState(current);

    const commit = (next: DockState) => {
      if (next === current) return;
      current = next;
      setState(next);
    };

    const evaluate = () => {
      const y = Math.max(0, window.scrollY);
      if (y <= shellH) {
        anchor = y;
        dir = 0;
        commit('hidden');
      } else {
        const d = Math.sign(y - last);
        if (d !== 0 && d !== dir) {
          dir = d;
          anchor = last;
        }
        if (current === 'hidden') commit('compact');
        else if (dir > 0 && y - anchor > 6) commit('compact');
        else if (dir < 0 && anchor - y > expandAfter) commit('expanded');
      }
      last = y;
    };

    const ro = new ResizeObserver(() => {
      shellH = shell.current?.offsetHeight ?? 0;
      evaluate();
    });
    if (shell.current) ro.observe(shell.current);
    // Tarayıcı scroll olayını zaten kare başına en fazla bir kez tetikler; hesap ucuz, durum yalnızca eşikte değişir.
    window.addEventListener('scroll', evaluate, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', evaluate);
    };
  }, [shell, expandAfter]);
  return state;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Diyalog/çekmece içinde Tab odağını hapseder, Esc ile kapatır, kapanınca odağı geri verir. */
export function useDialog(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void, initialFocus?: RefObject<HTMLElement | null>) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusFirst = () => {
      const target = initialFocus?.current ?? node?.querySelector<HTMLElement>(FOCUSABLE) ?? node;
      target?.focus({ preventScroll: true });
    };
    const raf = requestAnimationFrame(focusFirst);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        closeRef.current();
        return;
      }
      if (e.key !== 'Tab' || !node) return;
      const items = [...node.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('keydown', onKey);
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open, ref, initialFocus]);
}
