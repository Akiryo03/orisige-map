'use client';

import { Location } from '@/app/types';
import { getProductsByLocation } from '@/app/lib/inventory';

interface LocationListProps {
  locations: Location[];
  onLocationClick: (location: Location) => void;
}

export default function LocationList({
  locations,
  onLocationClick,
}: LocationListProps) {
  const getLocationTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'roadside_station':
        return '道の駅';
      case 'shrine':
        return '神社';
      case 'shop':
        return 'ショップ';
      case 'gallery':
        return 'ギャラリー';
      default:
        return 'その他';
    }
  };

  const getLocationTypeColor = (type: Location['type']) => {
    switch (type) {
      case 'roadside_station':
        return 'bg-[#D4A574]/10 text-[#8B6F47]';
      case 'shrine':
        return 'bg-red-100 text-red-700';
      case 'shop':
        return 'bg-[#8b2635]/10 text-[#8b2635]';
      case 'gallery':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📍</span>
          <h2 className="text-lg font-bold text-gray-800">販売店一覧</h2>
        </div>
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#8b2635]/10 text-[#8b2635] text-sm font-medium">
          {locations.length} 店舗
        </span>
      </div>

      {locations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-sm">
            条件に一致する販売店が見つかりませんでした
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {locations.map((location) => {
            const productsWithInventory = getProductsByLocation(location.id);
            const totalStock = productsWithInventory.reduce(
              (sum, p) => sum + p.stock,
              0
            );

            return (
              <div
                key={location.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-[#8b2635] hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => onLocationClick(location)}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-1 truncate">
                      {location.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {location.address}
                    </p>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full whitespace-nowrap font-medium ${getLocationTypeColor(
                      location.type
                    )}`}
                  >
                    {getLocationTypeLabel(location.type)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <span className="text-gray-500">🏷️</span>
                      <span className="font-medium">
                        {productsWithInventory.length} 商品
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="text-gray-500">📦</span>
                      <span
                        className={`font-medium ${
                          totalStock > 0 ? 'text-green-600' : 'text-gray-400'
                        }`}
                      >
                        在庫 {totalStock}
                      </span>
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLocationClick(location);
                    }}
                    className="px-3 py-1.5 bg-[#8b2635] hover:bg-[#6d1d28] text-white text-xs font-medium rounded-md transition-colors"
                  >
                    地図で見る
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
