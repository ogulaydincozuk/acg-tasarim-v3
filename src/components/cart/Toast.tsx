import { Check, Info, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShop } from '../../context/ShopContext';
import { Img } from '../ui/Img';
import s from './Toast.module.css';

export function Toast() {
  const { toast, dismissToast, holdToast, releaseToast, setCartOpen } = useShop();

  return (
    <div className={s.region} aria-live="polite" aria-atomic="true">
      {toast && (
        <div
          key={toast.id}
          className={s.toast}
          role="status"
          onMouseEnter={holdToast}
          onMouseLeave={releaseToast}
          onFocus={holdToast}
          onBlur={releaseToast}
          onTouchStart={holdToast}
          onTouchEnd={releaseToast}
        >
          {toast.product && <Img image={toast.product.image} alt="" ratio={1} sizes="56px" maxWidth={320} className={s.thumb} />}
          <div className={s.text}>
            <p className={s.title}>
              {toast.action ? <Check aria-hidden="true" /> : <Info aria-hidden="true" className={s.info} />}
              {toast.title}
            </p>
            {toast.product && <p className={s.name}>{toast.product.name}</p>}
          </div>
          {toast.action === 'cart' && (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => {
                dismissToast();
                setCartOpen(true);
              }}
            >
              Sepeti gör
            </button>
          )}
          {toast.action === 'favorites' && (
            <Link to="/favoriler" className="btn btn--secondary btn--sm" onClick={dismissToast}>
              Favoriler
            </Link>
          )}
          <button type="button" className={s.close} onClick={dismissToast} aria-label="Bildirimi kapat">
            <X />
          </button>
        </div>
      )}
    </div>
  );
}
