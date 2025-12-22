import { inventory } from '@/app/data/inventory';
import { products } from '@/app/data/products';
import { Product, Inventory } from '@/app/types';

/**
 * 商品情報と在庫を結合した型
 */
export interface ProductWithInventory extends Product {
  stock: number;
  last_updated: string;
}

/**
 * 指定された販売場所の商品と在庫情報を取得
 */
export function getProductsByLocation(locationId: string): ProductWithInventory[] {
  const locationInventory = inventory.filter(
    (item) => item.location_id === locationId
  );

  return locationInventory
    .map((inv) => {
      const product = products.find((p) => p.id === inv.product_id);
      if (!product) return null;

      return {
        ...product,
        stock: inv.stock,
        last_updated: inv.last_updated,
      };
    })
    .filter((item): item is ProductWithInventory => item !== null);
}

/**
 * 在庫数に応じたステータス色を取得
 */
export function getStockStatus(stock: number): {
  color: string;
  bgColor: string;
  label: string;
} {
  if (stock === 0) {
    return {
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      label: '在庫なし',
    };
  } else if (stock <= 2) {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      label: `残り${stock}個`,
    };
  } else {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      label: `在庫${stock}個`,
    };
  }
}

/**
 * 価格を日本円形式でフォーマット
 */
export function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}
