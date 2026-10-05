import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { useBodyLock, useDialog } from '../../hooks/useUi';
import { cx } from '../../lib/format';
import s from './Drawer.module.css';

interface DrawerProps {
  id?: string;
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  side?: 'right' | 'left' | 'bottom';
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
  className?: string;
}

/** Çıkış animasyonunun süresi (ms): bittiğinde çekmece DOM'dan kaldırılır. */
const EXIT_MS = 450;

/**
 * Yan/alt çekmece: mobil menü, sepet, mobil filtre.
 * Kapalıyken DOM'da DURMAZ: ekran dışına park edilmiş sabit konumlu panel, iOS Safari'de sayfayı
 * yatay kaydırılabilir yapıp içeriği yana kaydırıyordu. Yalnızca açıkken ve çıkış animasyonu sürerken çizilir.
 */
export function Drawer({ id, open, onClose, title, side = 'right', children, footer, width = 440, className }: DrawerProps) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const wasOpen = useRef(false);
  const [shown, setShown] = useState(false); // .open sınıfı: giriş/çıkış geçişini sürer
  const [exiting, setExiting] = useState(false); // çıkış animasyonu bitene kadar DOM'da kal

  useBodyLock(open);
  useDialog(panel, open, onClose);

  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      setExiting(false);
      void root.current?.offsetWidth; // kapalı konum boyansın, sonra geçiş başlasın
      setShown(true);
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    setShown(false);
    setExiting(true);
    const t = window.setTimeout(() => setExiting(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

  if (!open && !exiting) return null;

  return createPortal(
    <div ref={root} className={cx(s.root, shown && s.open)} inert={!open}>
      <div className={s.backdrop} onClick={onClose} aria-hidden="true" />
      <div
        id={id}
        ref={panel}
        className={cx(s.panel, s[side], className)}
        style={side !== 'bottom' ? { width: `min(${width}px, 100vw - 40px)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <header className={s.head}>
          <div id={titleId} className={s.title}>
            {title}
          </div>
          <button type="button" className={s.close} onClick={onClose} aria-label="Kapat">
            <X strokeWidth={2} />
          </button>
        </header>
        <div className={s.body}>{children}</div>
        {footer && <footer className={s.foot}>{footer}</footer>}
      </div>
    </div>,
    document.body,
  );
}
