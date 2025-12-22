import { Inventory } from '@/app/types';

/**
 * 在庫データ
 */
export const inventory: Inventory[] = [
  // みほふれ愛プラザ
  {
    location_id: 'miho-fureai-plaza',
    product_id: 'inori-horse',
    stock: 2,
    last_updated: '2025-12-20',
  },
  {
    location_id: 'miho-fureai-plaza',
    product_id: 'sugitags',
    stock: 10,
    last_updated: '2025-12-20',
  },

  // かわち夢楽
  {
    location_id: 'kawachi-yumeraku',
    product_id: 'mokumoku',
    stock: 15,
    last_updated: '2025-12-20',
  },
  {
    location_id: 'kawachi-yumeraku',
    product_id: 'kunkun',
    stock: 12,
    last_updated: '2025-12-20',
  },

  // 発酵の里こうざき
  {
    location_id: 'hakko-no-sato-kouzaki',
    product_id: 'hashikko',
    stock: 10,
    last_updated: '2025-12-20',
  },

  // 諏訪大神
  {
    location_id: 'suwa-daijin',
    product_id: 'inori-horse',
    stock: 5,
    last_updated: '2025-12-20',
  },

  // 多田朝日森稲荷神社
  {
    location_id: 'tada-asahimori-inari',
    product_id: 'inori-horse',
    stock: 3,
    last_updated: '2025-12-20',
  },
];
