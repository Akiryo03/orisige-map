import { Location, FilterState } from '@/app/types';
import { getProductsByLocation } from './inventory';

/**
 * フィルター条件に基づいて販売場所をフィルタリング
 */
export function filterLocations(
  locations: Location[],
  filters: FilterState
): Location[] {
  return locations.filter((location) => {
    // 場所の種類でフィルタリング
    if (filters.locationType && location.type !== filters.locationType) {
      return false;
    }

    const productsWithInventory = getProductsByLocation(location.id);

    // 商品カテゴリでフィルタリング
    if (filters.category) {
      const hasCategory = productsWithInventory.some(
        (product) => product.category === filters.category
      );
      if (!hasCategory) {
        return false;
      }
    }

    // 在庫ありのみ表示
    if (filters.inStockOnly) {
      const hasStock = productsWithInventory.some(
        (product) => product.stock > 0
      );
      if (!hasStock) {
        return false;
      }
    }

    return true;
  });
}
