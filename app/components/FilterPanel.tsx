'use client';

import { useState } from 'react';
import { FilterState, Location } from '@/app/types';

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  availableCategories: string[];
}

export default function FilterPanel({
  filters,
  onFilterChange,
  availableCategories,
}: FilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const locationTypes: { value: Location['type'] | null; label: string }[] = [
    { value: null, label: '全て表示' },
    { value: 'roadside_station', label: '道の駅' },
    { value: 'shrine', label: '神社' },
    { value: 'shop', label: 'ショップ' },
    { value: 'gallery', label: 'ギャラリー' },
    { value: 'other', label: 'その他' },
  ];

  // カテゴリ名の日本語表示
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      kurashi: 'くらし',
      kokoro: 'こころ',
      'tema-hima': 'てまひま',
      taberu: 'たべる',
      'All ibaraki project': 'All ibaraki project',
    };
    return labels[category] || category;
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100">
      {/* モバイル: 折りたたみヘッダー */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden w-full p-4 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔍</span>
          <h2 className="text-lg font-bold text-gray-800">フィルター</h2>
        </div>
        <span className="text-2xl text-gray-400">
          {isOpen ? '▲' : '▼'}
        </span>
      </button>

      {/* フィルター内容 */}
      <div className={`p-6 ${isOpen ? 'block' : 'hidden'} lg:block`}>
        {/* デスクトップ: ヘッダー */}
        <div className="hidden lg:flex items-center gap-2 mb-6">
          <span className="text-2xl">🔍</span>
          <h2 className="text-lg font-bold text-gray-800">フィルター</h2>
        </div>

        {/* 商品カテゴリフィルター */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-[#D4A574]">🏷️</span>
            商品カテゴリ
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => onFilterChange({ ...filters, category: null })}
              className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                filters.category === null
                  ? 'bg-[#8b2635] text-white shadow-md'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              全て表示
            </button>
            {availableCategories.map((category) => (
              <button
                key={category}
                onClick={() => onFilterChange({ ...filters, category })}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filters.category === category
                    ? 'bg-[#8b2635] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                {getCategoryLabel(category)}
              </button>
            ))}
          </div>
        </div>

        {/* 場所の種類フィルター */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-[#D4A574]">📍</span>
            場所の種類
          </h3>
          <div className="space-y-2">
            {locationTypes.map((type) => (
              <button
                key={type.value ?? 'all'}
                onClick={() =>
                  onFilterChange({ ...filters, locationType: type.value })
                }
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filters.locationType === type.value
                    ? 'bg-[#D4A574] text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 active:bg-gray-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* 在庫フィルター */}
        <div className="border-t border-gray-200 pt-4 mb-4">
          <label className="flex items-center gap-3 cursor-pointer group p-2">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) =>
                onFilterChange({ ...filters, inStockOnly: e.target.checked })
              }
              className="w-5 h-5 rounded border-gray-300 text-[#8b2635] focus:ring-[#8b2635] cursor-pointer"
            />
            <span className="text-sm font-medium text-gray-700 group-hover:text-[#8b2635] transition-colors">
              在庫ありのみ表示
            </span>
          </label>
        </div>

        {/* リセットボタン */}
        <div>
          <button
            onClick={() =>
              onFilterChange({
                category: null,
                locationType: null,
                inStockOnly: false,
              })
            }
            className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 text-sm font-medium rounded-lg transition-colors"
          >
            フィルターをリセット
          </button>
        </div>
      </div>
    </div>
  );
}
