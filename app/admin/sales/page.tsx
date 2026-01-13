'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { collection, addDoc, getDocs, query, orderBy, where, updateDoc, doc, Timestamp } from 'firebase/firestore';
import { Location, Product, Sale } from '../../types';

export default function SalesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // フォームデータ
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    productId: '',
    locationId: '',
    quantity: 1,
  });

  // マスターデータ
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  // 認証チェック
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/admin/login');
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // マスターデータとメタデータを取得
  useEffect(() => {
    async function fetchData() {
      if (!db) return;

      try {
        const [locationsSnap, productsSnap, salesSnap] = await Promise.all([
          getDocs(collection(db, 'locations')),
          getDocs(collection(db, 'products')),
          getDocs(query(collection(db, 'sales'), orderBy('date', 'desc'))),
        ]);

        const locationsData = locationsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Location[];

        const productsData = productsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const salesData = salesSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Sale[];

        setLocations(locationsData);
        setProducts(productsData);
        setSales(salesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('データの取得に失敗しました');
      }
    }

    if (!loading) {
      fetchData();
    }
  }, [loading]);

  // 売上を登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db) {
      alert('Firebaseが初期化されていません');
      return;
    }

    if (!formData.productId || !formData.locationId || formData.quantity < 1) {
      alert('すべての項目を正しく入力してください');
      return;
    }

    setSubmitting(true);

    try {
      // 売上データを追加
      const saleData = {
        date: formData.date,
        productId: formData.productId,
        locationId: formData.locationId,
        quantity: formData.quantity,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'sales'), saleData);

      // 在庫を減らす処理
      try {
        const inventoryQuery = query(
          collection(db, 'inventory'),
          where('productId', '==', formData.productId),
          where('locationId', '==', formData.locationId)
        );

        const inventorySnap = await getDocs(inventoryQuery);

        if (!inventorySnap.empty) {
          const inventoryDoc = inventorySnap.docs[0];
          const currentStock = inventoryDoc.data().stock || 0;
          const newStock = Math.max(0, currentStock - formData.quantity);

          await updateDoc(doc(db, 'inventory', inventoryDoc.id), {
            stock: newStock,
            lastUpdated: Timestamp.now(),
          });

          if (newStock === 0) {
            alert(`売上を登録しました。\n注意: ${products.find(p => p.id === formData.productId)?.name}の在庫が0になりました。`);
          } else {
            alert(`売上を登録しました。\n残在庫: ${newStock}個`);
          }
        } else {
          alert('売上を登録しましたが、在庫データが見つかりませんでした。');
        }
      } catch (inventoryError) {
        console.error('Error updating inventory:', inventoryError);
        alert('売上は登録されましたが、在庫の更新に失敗しました。');
      }

      // フォームをリセット
      setFormData({
        date: new Date().toISOString().split('T')[0],
        productId: '',
        locationId: '',
        quantity: 1,
      });

      // 売上一覧を再取得
      const salesSnap = await getDocs(query(collection(db, 'sales'), orderBy('date', 'desc')));
      const salesData = salesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Sale[];
      setSales(salesData);

    } catch (error) {
      console.error('Error adding sale:', error);
      alert('売上の登録に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-black">売上管理</h1>
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ダッシュボードに戻る
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 売上入力フォーム */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-6 pb-3 border-b-2 border-[#c69c6d]">
              売上入力
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* 日付 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  日付 <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent"
                  required
                />
              </div>

              {/* 商品 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 販売店 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  販売店 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.locationId}
                  onChange={(e) => setFormData({ ...formData, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent"
                  required
                >
                  <option value="">選択してください</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 数量 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数量 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent"
                  required
                />
              </div>

              {/* 登録ボタン */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-4 py-3 bg-[#8b2635] text-white font-medium rounded-lg hover:bg-[#6d1d28] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? '登録中...' : '売上を登録'}
              </button>
            </form>
          </div>

          {/* 最近の売上履歴 */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-black mb-6 pb-3 border-b-2 border-[#c69c6d]">
              最近の売上履歴
            </h2>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {sales.length === 0 ? (
                <p className="text-gray-500 text-center py-8">売上データがありません</p>
              ) : (
                sales.slice(0, 20).map((sale) => {
                  const product = products.find((p) => p.id === sale.productId);
                  const location = locations.find((l) => l.id === sale.locationId);

                  return (
                    <div
                      key={sale.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-black">{product?.name || '不明な商品'}</div>
                        <div className="text-sm text-gray-600">{sale.date}</div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {location?.name || '不明な販売店'} / {sale.quantity}個
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
