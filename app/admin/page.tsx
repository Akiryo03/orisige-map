'use client';

import { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    locations: 0,
    inventory: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!db) return;

      try {
        const [productsSnap, locationsSnap, inventorySnap] = await Promise.all([
          getDocs(collection(db, 'products')),
          getDocs(collection(db, 'locations')),
          getDocs(collection(db, 'inventory')),
        ]);

        setStats({
          products: productsSnap.size,
          locations: locationsSnap.size,
          inventory: inventorySnap.size,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: '商品',
      count: stats.products,
      icon: '🎁',
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-700',
      link: '/admin/products',
    },
    {
      title: '販売場所',
      count: stats.locations,
      icon: '🏪',
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-700',
      link: '/admin/locations',
    },
    {
      title: '在庫アイテム',
      count: stats.inventory,
      icon: '📦',
      color: 'bg-purple-50 border-purple-200',
      textColor: 'text-purple-700',
      link: '/admin/inventory',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ダッシュボード
        </h1>
        <p className="text-gray-600">
          orisige販売店マップの管理画面へようこそ
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.link}
            className={`${card.color} border rounded-xl p-6 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-3xl font-bold ${card.textColor}`}>
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    card.count
                  )}
                </p>
              </div>
              <div className="text-4xl">{card.icon}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* クイックアクション */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">
          クイックアクション
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/inventory"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-medium text-gray-800 group-hover:text-[#8b2635]">
                在庫を更新
              </p>
              <p className="text-sm text-gray-600">
                商品の在庫数を編集
              </p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <span className="text-2xl">➕</span>
            <div>
              <p className="font-medium text-gray-800 group-hover:text-[#8b2635]">
                新規商品を追加
              </p>
              <p className="text-sm text-gray-600">
                新しい商品を登録
              </p>
            </div>
          </Link>

          <Link
            href="/admin/locations"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <span className="text-2xl">🗺️</span>
            <div>
              <p className="font-medium text-gray-800 group-hover:text-[#8b2635]">
                販売場所を管理
              </p>
              <p className="text-sm text-gray-600">
                店舗情報を編集
              </p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center gap-3 p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
          >
            <span className="text-2xl">🌐</span>
            <div>
              <p className="font-medium text-gray-800 group-hover:text-[#8b2635]">
                サイトを表示
              </p>
              <p className="text-sm text-gray-600">
                公開ページを確認
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
