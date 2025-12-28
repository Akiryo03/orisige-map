'use client';

import { useState, useMemo, useEffect } from 'react';
import Map from './components/Map';
import FilterPanel from './components/FilterPanel';
import LocationList from './components/LocationList';
import { FilterState, Location, Product } from './types';
import { filterLocations } from './lib/filters';
import { db } from './lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function Home() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  const [filters, setFilters] = useState<FilterState>({
    category: null,
    locationType: null,
    inStockOnly: false,
  });

  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );

  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestoreからデータを取得
  useEffect(() => {
    async function fetchData() {
      if (!db) {
        setLoading(false);
        return;
      }

      try {
        const [locationsSnap, productsSnap, inventorySnap] = await Promise.all([
          getDocs(collection(db, 'locations')),
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'inventory')),
        ]);

        const locationsData = locationsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Location[];

        const productsData = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const inventoryData = inventorySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // 在庫情報を商品データに統合
        const productsWithInventory = productsData.map((product) => {
          const inventory = inventoryData.filter((inv: any) => inv.productId === product.id);
          return {
            ...product,
            inventory: inventory.map((inv: any) => ({
              locationId: inv.locationId,
              stock: inv.stock,
            })),
          };
        });

        setLocations(locationsData);
        setProducts(productsWithInventory);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // フィルタリングされた場所
  const filteredLocations = useMemo(
    () => filterLocations(locations, filters),
    [locations, filters]
  );

  // 利用可能なカテゴリ一覧
  const availableCategories = useMemo(() => {
    const categories = new Set(products.map((p) => p.category));
    return Array.from(categories);
  }, [products]);

  // 場所がクリックされたときの処理
  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    // 地図の中心を移動（Map コンポーネントに実装が必要）
    // TODO: Implement map pan functionality
  };

  // ローディング中の表示
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#8b2635] mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {/* ロゴ */}
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black tracking-wider mb-2">
                orisige
              </h1>
              {/* サブタイトル */}
              <p className="text-xs sm:text-sm text-black border-l-4 border-[#c69c6d] pl-3 mb-1">
                茨城県伝統工芸品 第67号 河内町 杉折箱
              </p>
              <p className="text-xs text-gray-600 pl-3">
                取扱店舗マップ
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <a
                href="https://www.instagram.com/orisige1966/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2.5 rounded-lg bg-[#8b2635] text-white font-medium hover:bg-[#6d1d28] transition-all shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#8b2635] focus:ring-offset-2"
                aria-label="orisige公式Instagramを開く"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
              <span className="inline-flex items-center px-4 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-black font-medium" role="status" aria-live="polite">
                <span className="mr-2 text-[#8b2635]" aria-hidden="true">📍</span>
                <span>{filteredLocations.length} / {locations.length} 店舗</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-3 space-y-6">
            {/* 商品カテゴリフィルター */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 sticky top-24">
              <h3 className="text-base font-bold text-black mb-4 pb-3 border-b-2 border-[#c69c6d]">
                商品カテゴリで絞り込み
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilters({ ...filters, category: null })}
                  className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                    filters.category === null
                      ? 'bg-[#8b2635] text-white'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  すべて
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setFilters({ ...filters, category })}
                    className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                      filters.category === category
                        ? 'bg-[#8b2635] text-white'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {category === 'kurashi' && 'くらし'}
                    {category === 'kokoro' && 'こころ'}
                    {category === 'tema-hima' && 'てまひま'}
                    {category === 'taberu' && 'たべる'}
                    {category === 'All ibaraki project' && 'All ibaraki project'}
                  </button>
                ))}
              </div>

              {/* 販売店フィルター */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-base font-bold text-black mb-4 pb-3 border-b-2 border-[#c69c6d]">
                  販売店で絞り込み
                </h3>

                {/* 種別フィルター */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    種別
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilters({ ...filters, locationType: null })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                        filters.locationType === null
                          ? 'bg-[#8b2635] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      すべて
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, locationType: 'roadside_station' })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                        filters.locationType === 'roadside_station'
                          ? 'bg-[#8b2635] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      道の駅
                    </button>
                    <button
                      onClick={() => setFilters({ ...filters, locationType: 'shrine' })}
                      className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                        filters.locationType === 'shrine'
                          ? 'bg-[#8b2635] text-white'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      神社
                    </button>
                  </div>
                </div>

                {/* 在庫フィルター */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    在庫状況
                  </label>
                  <div className="flex items-center px-4 py-2.5 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={filters.inStockOnly}
                      onChange={(e) =>
                        setFilters({ ...filters, inStockOnly: e.target.checked })
                      }
                      className="w-4 h-4 text-[#8b2635] bg-gray-100 border-gray-300 rounded focus:ring-[#8b2635] focus:ring-2"
                    />
                    <label htmlFor="inStock" className="ml-3 text-sm text-gray-700 font-medium">
                      在庫ありのみ表示
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Content - Map and Table */}
          <div className="lg:col-span-9">
            {/* Map */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                {apiKey ? (
                  <Map
                    locations={filteredLocations}
                    apiKey={apiKey}
                    selectedLocation={selectedLocation}
                  />
                ) : (
                  <div className="flex items-center justify-center h-[400px] sm:h-[500px] lg:h-[600px] bg-gray-50">
                    <div className="text-center px-4">
                      <p className="text-gray-600 mb-2">
                        Google Maps APIキーが設定されていません
                      </p>
                      <p className="text-sm text-gray-500">
                        .env.localファイルにNEXT_PUBLIC_GOOGLE_MAPS_API_KEYを設定してください
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Location Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-black">
              取扱店舗一覧
              <span className="ml-3 text-sm font-normal text-gray-600">
                （{filteredLocations.length}件）
              </span>
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    店舗名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    住所
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    営業時間
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">
                    定休日
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-black uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLocations.map((location) => (
                  <tr
                    key={location.id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => handleLocationClick(location)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{location.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-[#8b2635] text-white">
                        {location.type === 'roadside_station' && '道の駅'}
                        {location.type === 'shrine' && '神社'}
                        {location.type === 'shop' && 'ショップ'}
                        {location.type === 'gallery' && 'ギャラリー'}
                        {location.type === 'other' && 'その他'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{location.address}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{location.hours}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{location.closed_days}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLocationClick(location);
                        }}
                        className="inline-flex items-center px-3 py-1.5 border border-[#8b2635] text-xs font-medium rounded-md text-[#8b2635] bg-white hover:bg-[#8b2635] hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b2635] focus:ring-offset-2"
                      >
                        地図で表示
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 bg-gray-50 border-t border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* 会社情報 */}
            <div>
              <div className="flex items-start gap-4 mb-6">
                {/* ロゴ画像スペース */}
                <div className="w-20 h-20 flex-shrink-0 bg-white border-2 border-gray-200 rounded-lg shadow-sm flex items-center justify-center">
                  <img
                    src="/orisige-logo.svg"
                    alt="orisige ロゴ"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-black">
                    orisige
                  </h3>
                  <p className="text-sm text-black mb-1 font-medium">
                    茨城県伝統工芸品 第67号
                  </p>
                  <p className="text-sm text-black">
                    河内町 杉折箱
                  </p>
                </div>
              </div>
            </div>

            {/* 連絡先 */}
            <div>
              <h4 className="text-base font-bold mb-4 text-black border-b-2 border-[#c69c6d] pb-2 inline-block">お問い合わせ</h4>
              <div className="space-y-3 text-sm text-black mt-4">
                <p className="flex items-start gap-3">
                  <span className="text-[#8b2635] text-lg" aria-hidden="true">📍</span>
                  <span>茨城県稲敷郡河内町生板5495</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-[#8b2635] text-lg" aria-hidden="true">📞</span>
                  <a
                    href="tel:0297-84-2625"
                    className="hover:text-[#8b2635] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b2635] focus:ring-offset-2 rounded px-1"
                    aria-label="電話をかける"
                  >
                    0297-84-2625
                  </a>
                </p>
                <p className="flex items-center gap-3">
                  <span className="text-[#8b2635] text-lg" aria-hidden="true">✉️</span>
                  <a
                    href="mailto:orisige0918@gmail.com"
                    className="hover:text-[#8b2635] hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-[#8b2635] focus:ring-offset-2 rounded px-1"
                    aria-label="メールを送る"
                  >
                    orisige0918@gmail.com
                  </a>
                </p>
              </div>
            </div>

            {/* リンク */}
            <div>
              <h4 className="text-base font-bold mb-4 text-black border-b-2 border-[#c69c6d] pb-2 inline-block">オンラインショップ</h4>
              <div className="space-y-3 mt-4">
                <a
                  href="https://www.orisige.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-[#8b2635] rounded-lg transition-all text-sm text-gray-800 hover:text-[#8b2635] font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#8b2635] focus:ring-offset-2"
                  aria-label="orisige ECショップを開く"
                >
                  <span aria-hidden="true" className="text-xl">🛒</span>
                  <span>ECショップ</span>
                </a>
                <a
                  href="https://www.instagram.com/orisige1966/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-5 py-3 bg-white hover:bg-gray-100 border-2 border-gray-200 hover:border-[#8b2635] rounded-lg transition-all text-sm text-gray-800 hover:text-[#8b2635] font-medium shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-[#8b2635] focus:ring-offset-2"
                  aria-label="orisige公式Instagramを開く"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* コピーライト */}
          <div className="border-t border-gray-200 pt-8 text-center">
            <div className="inline-flex items-center gap-2 mb-4" aria-hidden="true">
              <div className="w-2 h-2 bg-[#c69c6d] rounded-full"></div>
              <div className="w-2 h-2 bg-[#8b2635] rounded-full"></div>
              <div className="w-2 h-2 bg-[#c69c6d] rounded-full"></div>
            </div>
            <p className="text-xs text-gray-500">
              © 2024 orisige. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
