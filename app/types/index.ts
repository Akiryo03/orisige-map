/**
 * 販売場所の型定義
 */
export interface Location {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  closedDays: string;
  phone?: string;
  website?: string;
  type: 'roadside_station' | 'shop' | 'gallery' | 'shrine' | 'other';
  description?: string;
}

/**
 * 商品の型定義
 */
export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  description?: string;
}

/**
 * 在庫の型定義
 */
export interface Inventory {
  location_id?: string; // 後方互換性のため残す
  product_id?: string; // 後方互換性のため残す
  locationId?: string;
  productId?: string;
  stock: number;
  last_updated?: string;
  lastUpdated?: Date;
}

/**
 * フィルター条件の型定義
 */
export interface FilterState {
  category: string | null; // 商品カテゴリ (null = 全て)
  locationType: Location['type'] | null; // 場所の種類 (null = 全て)
  inStockOnly: boolean; // 在庫ありのみ表示
}
