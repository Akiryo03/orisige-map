'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Sale, Product } from '../../../types';

type Period = 'daily' | 'monthly' | 'yearly';

export default function SalesAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('monthly');

  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // 認証チェック
  useEffect(() => {
    if (!auth) {
      router.push('/admin/login');
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // データ取得
  useEffect(() => {
    async function fetchData() {
      if (!db) return;

      try {
        const [salesSnap, productsSnap] = await Promise.all([
          getDocs(query(collection(db, 'sales'), orderBy('date', 'asc'))),
          getDocs(collection(db, 'products')),
        ]);

        const salesData = salesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sale[];

        const productsData = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setSales(salesData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    if (!loading) {
      fetchData();
    }
  }, [loading]);

  // 期間ごとの集計データ（商品別）
  const aggregatedData = useMemo(() => {
    if (sales.length === 0) return [];

    const grouped: Record<string, {
      period: string;
      totalQuantity: number;
      totalRevenue: number;
      products: Record<string, { quantity: number; revenue: number; name: string }>;
    }> = {};

    sales.forEach((sale) => {
      const date = new Date(sale.date);
      let key = '';

      if (period === 'daily') {
        key = sale.date; // YYYY-MM-DD
      } else if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // YYYY-MM
      } else {
        key = `${date.getFullYear()}`; // YYYY
      }

      if (!grouped[key]) {
        grouped[key] = {
          period: key,
          totalQuantity: 0,
          totalRevenue: 0,
          products: {},
        };
      }

      const product = products.find((p) => p.id === sale.productId);
      const productName = product?.name || '不明な商品';
      const price = product?.price || 0;

      if (!grouped[key].products[sale.productId]) {
        grouped[key].products[sale.productId] = {
          quantity: 0,
          revenue: 0,
          name: productName,
        };
      }

      grouped[key].products[sale.productId].quantity += sale.quantity;
      grouped[key].products[sale.productId].revenue += sale.quantity * price;
      grouped[key].totalQuantity += sale.quantity;
      grouped[key].totalRevenue += sale.quantity * price;
    });

    return Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));
  }, [sales, products, period]);

  // 最大値の計算（グラフの高さ調整用）
  const maxQuantity = useMemo(() => {
    return Math.max(...aggregatedData.map((d) => d.totalQuantity), 0);
  }, [aggregatedData]);

  const maxRevenue = useMemo(() => {
    return Math.max(...aggregatedData.map((d) => d.totalRevenue), 0);
  }, [aggregatedData]);

  // 商品ごとの色を生成
  const productColors = useMemo(() => {
    const uniqueProductIds = Array.from(
      new Set(sales.map((s) => s.productId))
    );

    const colors = [
      '#8b2635', // えんじ色
      '#c69c6d', // ゴールド
      '#5a7d7c', // 青緑
      '#9b6b4f', // 茶色
      '#6b7c8b', // グレー青
      '#8b6b7c', // 紫
      '#7c8b6b', // オリーブ
      '#8b7c6b', // ベージュ
    ];

    const colorMap: Record<string, string> = {};
    uniqueProductIds.forEach((id, index) => {
      colorMap[id] = colors[index % colors.length];
    });

    return colorMap;
  }, [sales]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b2635]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-black">売上分析</h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/sales')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                売上登録に戻る
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ダッシュボード
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 期間選択 */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-bold text-black mb-4">表示期間</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setPeriod('daily')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                period === 'daily'
                  ? 'bg-[#8b2635] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              日次
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-[#8b2635] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              月次
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
                period === 'yearly'
                  ? 'bg-[#8b2635] text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              年次
            </button>
          </div>
        </div>

        {/* 売上数量グラフ */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-bold text-black mb-6 pb-3 border-b-2 border-[#c69c6d]">
            売上数量推移（商品別）
          </h2>

          {aggregatedData.length === 0 ? (
            <p className="text-gray-500 text-center py-12">データがありません</p>
          ) : (
            <div className="space-y-4">
              {aggregatedData.map((data) => {
                const totalWidth = maxQuantity > 0 ? (data.totalQuantity / maxQuantity) * 100 : 0;

                return (
                  <div key={data.period}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-24 text-sm text-gray-700 font-medium">{data.period}</div>
                      <div className="flex-1">
                        <div className="flex rounded overflow-hidden" style={{ width: `${totalWidth}%`, minWidth: '4rem', height: '2.5rem' }}>
                          {Object.entries(data.products).map(([productId, productData], index) => {
                            const productWidth = data.totalQuantity > 0 ? (productData.quantity / data.totalQuantity) * 100 : 0;
                            return (
                              <div
                                key={productId}
                                className="flex items-center justify-center text-xs font-medium text-white transition-all duration-300 hover:opacity-80"
                                style={{
                                  width: `${productWidth}%`,
                                  backgroundColor: productColors[productId],
                                  minWidth: productData.quantity > 0 ? '2rem' : '0',
                                }}
                                title={`${productData.name}: ${productData.quantity}個`}
                              >
                                {productData.quantity > 0 && productWidth > 10 && `${productData.quantity}`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700 min-w-[60px]">計{data.totalQuantity}個</div>
                    </div>
                    {/* 商品詳細 */}
                    <div className="ml-28 flex flex-wrap gap-2 text-xs">
                      {Object.entries(data.products).map(([productId, productData]) => (
                        <div key={productId} className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: productColors[productId] }}
                          />
                          <span className="text-gray-600">
                            {productData.name}: {productData.quantity}個
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 売上金額グラフ */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-black mb-6 pb-3 border-b-2 border-[#c69c6d]">
            売上金額推移（商品別）
          </h2>

          {aggregatedData.length === 0 ? (
            <p className="text-gray-500 text-center py-12">データがありません</p>
          ) : (
            <div className="space-y-4">
              {aggregatedData.map((data) => {
                const totalWidth = maxRevenue > 0 ? (data.totalRevenue / maxRevenue) * 100 : 0;

                return (
                  <div key={data.period}>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-24 text-sm text-gray-700 font-medium">{data.period}</div>
                      <div className="flex-1">
                        <div className="flex rounded overflow-hidden" style={{ width: `${totalWidth}%`, minWidth: '4rem', height: '2.5rem' }}>
                          {Object.entries(data.products).map(([productId, productData]) => {
                            const productWidth = data.totalRevenue > 0 ? (productData.revenue / data.totalRevenue) * 100 : 0;
                            return (
                              <div
                                key={productId}
                                className="flex items-center justify-center text-xs font-medium text-white transition-all duration-300 hover:opacity-80"
                                style={{
                                  width: `${productWidth}%`,
                                  backgroundColor: productColors[productId],
                                  minWidth: productData.revenue > 0 ? '2rem' : '0',
                                }}
                                title={`${productData.name}: ¥${productData.revenue.toLocaleString()}`}
                              >
                                {productData.revenue > 0 && productWidth > 15 && `¥${(productData.revenue / 1000).toFixed(0)}k`}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-700 min-w-[80px]">計¥{data.totalRevenue.toLocaleString()}</div>
                    </div>
                    {/* 商品詳細 */}
                    <div className="ml-28 flex flex-wrap gap-2 text-xs">
                      {Object.entries(data.products).map(([productId, productData]) => (
                        <div key={productId} className="flex items-center gap-1">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: productColors[productId] }}
                          />
                          <span className="text-gray-600">
                            {productData.name}: ¥{productData.revenue.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
