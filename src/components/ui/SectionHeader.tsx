import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cx } from '../../lib/format';
import s from './SectionHeader.module.css';

interface SectionHeaderProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { label: string; to: string };
  id?: string;
  align?: 'start' | 'center';
  className?: string;
  tone?: 'default' | 'dark';
}

export function SectionHeader({ eyebrow, title, description, action, id, align = 'start', className, tone = 'default' }: SectionHeaderProps) {
  return (
    <div className={cx(s.root, align === 'center' && s.center, tone === 'dark' && s.dark, className)}>
      <div className={s.text}>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2 id={id} className={s.title}>
          {title}
        </h2>
        {description && <p className={s.desc}>{description}</p>}
      </div>
      {action && (
        <Link to={action.to} className={cx('text-link', s.action)}>
          {action.label}
          <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}
