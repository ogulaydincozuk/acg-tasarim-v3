import type { UseCase, Usage } from './types';

/* --------------------------------------------------------------------------
   Mağaza bilgileri
   PLACEHOLDER: Kargo eşiği, süreler ve iletişim bilgileri örnektir;
   yayın öncesi ACG TASARIM'ın gerçek koşullarıyla güncellenmelidir.
   -------------------------------------------------------------------------- */
export const STORE = {
  freeShippingThreshold: 3000,
  /** PLACEHOLDER: eşiğin altındaki siparişlere eklenen demo kargo bedeli */
  shippingFee: 89.9,
  shippingNote: 'Hafta içi 15:00’e kadar verilen siparişler aynı gün kargoya verilir.',
  returnNote: 'Kullanılmamış ürünlerde 14 gün içinde koşulsuz iade.',
  phone: '0 (5xx) xxx xx xx',
  email: 'merhaba@acgtasarim.com',
  address: 'İzmir, Türkiye',
  hours: 'Hafta içi 09:00 – 18:00',
  /** PLACEHOLDER: hesap adresleri girildiğinde ikonlar doğrudan profile gider (boşsa bilgi mesajı gösterilir) */
  social: { instagram: '', youtube: '', tiktok: '', pinterest: '' } as Record<'instagram' | 'youtube' | 'tiktok' | 'pinterest', string>,
};

/* --------------------------------------------------------------------------
   Kullanım alanı açıklamaları (ürün detayındaki "Kullanım alanları" sekmesi)
   -------------------------------------------------------------------------- */
export const USE_CASES: Record<Usage, UseCase> = {
  mum: {
    usage: 'mum',
    title: 'Mum',
    summary: 'Soya wax’ı eritip esans ve pigmentle renklendir, kalıba dök; 24 saat sonra kalıptan çıkar.',
    image: 'bubblePink',
    duration: '≈ 2 saat + 24 saat dinlenme',
    level: 'Kolay',
    materialIds: ['p-101', 'p-102', 'p-105'],
  },
  'kokulu-tas': {
    usage: 'kokulu-tas',
    title: 'Kokulu taş',
    summary: 'Taş tozunu suyla karıştır, esansı ekle ve dök; 20 dakikada kalıptan çıkan kalıcı kokulu objeler.',
    image: 'leafStones',
    duration: '≈ 30 dk + 24 saat kuruma',
    level: 'Kolay',
    materialIds: ['p-106', 'p-102', 'p-108'],
  },
  dekorasyon: {
    usage: 'dekorasyon',
    title: 'Dekoratif obje',
    summary: 'Jesmonite veya taş tozuyla döküp boyayarak mumluk, tepsi ve raf objeleri üret.',
    image: 'concreteVessels',
    duration: '≈ 1 saat + 24 saat kuruma',
    level: 'Orta',
    materialIds: ['p-107', 'p-106', 'p-108'],
  },
  boyama: {
    usage: 'boyama',
    title: 'Boyama',
    summary: 'Kuruyan taş ve jesmonite objeleri pastel akriliklerle boyayıp mat vernikle koru.',
    image: 'watercolorFlowers',
    duration: '≈ 1 saat',
    level: 'Kolay',
    materialIds: ['p-108', 'p-106'],
  },
};

/* --------------------------------------------------------------------------
   Arama
   -------------------------------------------------------------------------- */
export const POPULAR_SEARCHES = ['bubble kalıp', 'soya wax', 'yılbaşı', 'vazo kalıbı', 'esans', 'başlangıç seti'];
