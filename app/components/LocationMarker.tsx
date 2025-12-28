'use client';

import { useState } from 'react';
import { AdvancedMarker, InfoWindow, Pin } from '@vis.gl/react-google-maps';
import { Location } from '@/app/types';
import {
  getProductsByLocation,
  getStockStatus,
  formatPrice,
  ProductWithInventory,
} from '@/app/lib/inventory';
import ProductDetailModal from './ProductDetailModal';

interface LocationMarkerProps {
  location: Location;
  isOpen: boolean;
  onToggle: (isOpen: boolean) => void;
}

export default function LocationMarker({ location, isOpen, onToggle }: LocationMarkerProps) {
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithInventory | null>(null);
  const productsWithInventory = getProductsByLocation(location.id);

  const position = {
    lat: location.latitude,
    lng: location.longitude,
  };

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

  return (
    <>
      <AdvancedMarker
        position={position}
        onClick={() => onToggle(true)}
        title={location.name}
      >
        <Pin
          background="#D4A574"
          borderColor="#8B6F47"
          glyphColor="#FFFFFF"
          scale={1.2}
        />
      </AdvancedMarker>

      {isOpen && (
        <InfoWindow
          position={position}
          onCloseClick={() => onToggle(false)}
          maxWidth={380}
        >
          <div className="p-3 font-sans max-h-[500px] overflow-y-auto">
            {/* ヘッダー */}
            <div className="mb-3 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block px-2.5 py-1 text-xs rounded-full bg-[#8b2635] text-white font-medium">
                  {getLocationTypeLabel(location.type)}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-2">
                {location.name}
              </h3>
              <div className="text-xs text-gray-600 space-y-1.5">
                <p className="flex items-start gap-1.5">
                  <span className="text-gray-500 mt-0.5">📍</span>
                  <span className="flex-1">{location.address}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-gray-500">🕐</span>
                  <span>{location.hours}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <span className="text-gray-500">📅</span>
                  <span>定休日: {location.closedDays}</span>
                </p>
              </div>
            </div>

            {/* 商品情報セクション */}
            <div className="mb-3">
              <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-1.5 pb-2 border-b border-gray-100">
                <span className="text-[#D4A574]">🏷️</span>
                取扱商品
                <span className="ml-auto text-xs font-normal text-gray-500">
                  {productsWithInventory.length}点
                </span>
              </h4>

              {productsWithInventory.length > 0 ? (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {productsWithInventory.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const isOutOfStock = product.stock === 0;

                    return (
                      <div
                        key={product.id}
                        className={`border rounded-lg p-3 transition-all ${
                          isOutOfStock
                            ? 'border-gray-200 bg-gray-50 opacity-60'
                            : 'border-[#D4A574]/30 bg-[#F5F5DC]/30 hover:border-[#D4A574]/50 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          {/* 商品画像エリア（将来の拡張用） */}
                          <div className="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-gray-400 text-xs">
                            No Image
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5
                              className={`text-sm font-semibold mb-1 ${
                                isOutOfStock ? 'text-gray-500' : 'text-gray-800'
                              }`}
                            >
                              {product.name}
                            </h5>
                            <p
                              className={`text-xs mb-1.5 ${
                                isOutOfStock ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              {product.category}
                            </p>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-base font-bold ${
                                  isOutOfStock ? 'text-gray-500' : 'text-[#8b2635]'
                                }`}
                              >
                                {formatPrice(product.price)}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${stockStatus.color} ${stockStatus.bgColor}`}
                              >
                                {stockStatus.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 商品詳細ボタン */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                          }}
                          className={`w-full mt-2 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#8b2635] hover:bg-[#6d1d28] text-white'
                          }`}
                          disabled={isOutOfStock}
                        >
                          商品詳細を見る
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 px-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">
                    取扱商品情報がありません
                  </p>
                  <p className="text-xs text-gray-400">
                    お店に直接お問い合わせください
                  </p>
                </div>
              )}
            </div>
          </div>
        </InfoWindow>
      )}

      {/* 商品詳細モーダル */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </>
  );
}
