import type { SVGProps } from 'react';

/* Marka ikonları lucide'da bulunmadığı için sade, tek renkli SVG'ler. */
const base = (props: SVGProps<SVGSVGElement>) => ({
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const InstagramIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
  </svg>
);

export const YoutubeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="2.5" y="5" width="19" height="14" rx="4" />
    <path d="M10 9.2v5.6l4.8-2.8z" fill="currentColor" stroke="none" />
  </svg>
);

export const TiktokIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M14 3v11.2a3.8 3.8 0 1 1-3.3-3.8" />
    <path d="M14 3c.4 2.6 2.2 4.4 5 4.6" />
  </svg>
);

export const PinterestIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M10.6 20.5 12.2 13" />
    <path d="M9.2 13.2c-.6-2.9 1.1-5.4 3.6-5.4 2.1 0 3.4 1.5 3.4 3.4 0 2.4-1.2 4.3-2.9 4.3-1 0-1.6-.8-1.4-1.7" />
  </svg>
);

export const WhatsappIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 20l1.2-3.6A8 8 0 1 1 8 19.1z" />
    <path d="M9 9.5c.3 1.9 1.6 3.9 4 5l1.2-1.1 2 .9c-.2 1.1-1.2 1.7-2.3 1.6C10.7 15.6 8.1 13 7.8 9.9c-.1-1 .5-2 1.6-2.2l.9 2z" />
  </svg>
);
