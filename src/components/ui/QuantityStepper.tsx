import { Minus, Plus } from 'lucide-react';
import { cx } from '../../lib/format';
import s from './QuantityStepper.module.css';

interface Props {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  label?: string;
}

export function QuantityStepper({ value, onChange, min = 1, max = 99, size = 'md', label = 'Adet' }: Props) {
  return (
    <div className={cx(s.root, size === 'sm' && s.sm)} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Azalt">
        <Minus />
      </button>
      <output aria-live="polite" className={s.value}>
        {value}
      </output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Artır">
        <Plus />
      </button>
    </div>
  );
}
