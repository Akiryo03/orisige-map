'use client';

import { ProductWithInventory } from '@/app/lib/inventory';
import { formatPrice } from '@/app/lib/inventory';

interface ProductDetailModalProps {
  product: ProductWithInventory;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  if (!isOpen) return null;

  const isOutOfStock = product.stock === 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-lg font-bold text-gray-800">商品詳細</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-6">
          {/* 商品画像エリア（将来の拡張用） */}
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 mb-6">
            No Image
          </div>

          {/* 商品情報 */}
          <div className="mb-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h3 className="text-2xl font-bold text-gray-800">
                {product.name}
              </h3>
              {isOutOfStock && (
                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-500 text-xs rounded-full font-medium whitespace-nowrap">
                  在庫切れ
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl font-bold text-[#8b2635]">
                {formatPrice(product.price)}
              </span>
              <span className="inline-block px-3 py-1 bg-[#D4A574]/10 text-[#8B6F47] text-sm rounded-full font-medium">
                {product.category}
              </span>
            </div>

            {/* 在庫情報 */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-500">📦</span>
              <span className="text-sm text-gray-700">
                在庫数:{' '}
                <span
                  className={`font-bold ${
                    product.stock === 0
                      ? 'text-gray-500'
                      : product.stock <= 2
                      ? 'text-red-600'
                      : 'text-green-600'
                  }`}
                >
                  {product.stock}
                </span>{' '}
                個
              </span>
              {product.last_updated && (
                <span className="ml-auto text-xs text-gray-400">
                  更新: {product.last_updated}
                </span>
              )}
            </div>

            {/* 商品説明 */}
            {product.description && (
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <span className="text-[#D4A574]">📝</span>
                  商品説明
                </h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}
          </div>

          {/* フッター */}
          <div className="border-t border-gray-200 pt-4 space-y-3">
            <p className="text-xs text-gray-500 text-center">
              在庫状況は店舗により異なる場合があります。
              <br />
              詳しくは店舗にお問い合わせください。
            </p>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-[#8b2635] hover:bg-[#6d1d28] active:bg-[#5a1822] text-white font-medium rounded-lg transition-colors"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
