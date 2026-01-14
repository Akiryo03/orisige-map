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
    salesChannel: 'store', // 'store' | 'ec' | 'event'
    locationId: '', // 店舗の場合はlocationId、ECは'ec-site'、イベントは'event-{イベント名}'
    eventName: '', // イベント出店の場合のイベント名
    quantity: 1,
    updateInventory: true, // 在庫を減らすかどうか（デフォルト: true）
  });

  // マスターデータ
  const [locations, setLocations] = useState<Location[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

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

    // バリデーション
    if (!formData.productId || formData.quantity < 1) {
      alert('商品と数量を入力してください');
      return;
    }

    // 販売チャネルごとのバリデーション
    let finalLocationId = '';
    if (formData.salesChannel === 'store') {
      if (!formData.locationId) {
        alert('販売店を選択してください');
        return;
      }
      finalLocationId = formData.locationId;
    } else if (formData.salesChannel === 'ec') {
      finalLocationId = 'ec-site';
    } else if (formData.salesChannel === 'event') {
      if (!formData.eventName.trim()) {
        alert('イベント名を入力してください');
        return;
      }
      finalLocationId = `event-${formData.eventName.trim()}`;
    }

    setSubmitting(true);

    try {
      // 売上データを追加
      const saleData = {
        date: formData.date,
        productId: formData.productId,
        locationId: finalLocationId,
        quantity: formData.quantity,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, 'sales'), saleData);

      // 在庫を減らす処理（updateInventoryがtrueかつ店舗販売の場合のみ）
      if (formData.updateInventory && formData.salesChannel === 'store') {
        try {
          const inventoryQuery = query(
            collection(db, 'inventory'),
            where('productId', '==', formData.productId),
            where('locationId', '==', finalLocationId)
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
      } else {
        const channelName =
          formData.salesChannel === 'ec' ? 'ECサイト' :
          formData.salesChannel === 'event' ? 'イベント出店' :
          '店舗';
        const message = formData.updateInventory && formData.salesChannel !== 'store'
          ? `売上を登録しました（${channelName}）。\n（ECサイト・イベントは在庫管理対象外です）`
          : '売上を登録しました。\n（在庫は変更されていません）';
        alert(message);
      }

      // フォームをリセット
      setFormData({
        date: new Date().toISOString().split('T')[0],
        productId: '',
        salesChannel: 'store',
        locationId: '',
        eventName: '',
        quantity: 1,
        updateInventory: true,
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
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/sales/analytics')}
                className="px-4 py-2 text-sm font-medium text-white bg-[#8b2635] rounded-lg hover:bg-[#6d1d28] transition-colors"
              >
                📊 売上分析
              </button>
              <button
                onClick={() => router.push('/admin')}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ダッシュボードに戻る
              </button>
            </div>
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

              {/* 販売チャネル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  販売チャネル <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, salesChannel: 'store', locationId: '', eventName: '' })}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      formData.salesChannel === 'store'
                        ? 'bg-[#8b2635] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🏪 店舗
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, salesChannel: 'ec', locationId: '', eventName: '' })}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      formData.salesChannel === 'ec'
                        ? 'bg-[#8b2635] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🌐 EC
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, salesChannel: 'event', locationId: '', eventName: '' })}
                    className={`px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      formData.salesChannel === 'event'
                        ? 'bg-[#8b2635] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    🎪 イベント
                  </button>
                </div>
              </div>

              {/* 販売店（店舗販売の場合のみ表示） */}
              {formData.salesChannel === 'store' && (
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
              )}

              {/* イベント名（イベント出店の場合のみ表示） */}
              {formData.salesChannel === 'event' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    イベント名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    placeholder="例: 春祭り2026"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent"
                    required
                  />
                </div>
              )}

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

              {/* 在庫操作（店舗販売の場合のみ表示） */}
              {formData.salesChannel === 'store' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    在庫操作
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, updateInventory: true })}
                      className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        formData.updateInventory
                          ? 'bg-[#8b2635] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      在庫を減らす
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, updateInventory: false })}
                      className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                        !formData.updateInventory
                          ? 'bg-[#8b2635] text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      在庫を減らさない
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {formData.updateInventory
                      ? '売上登録時に在庫が自動的に減ります'
                      : '過去データ入力用。在庫は変更されません'}
                  </p>
                </div>
              )}

              {/* EC・イベントの場合の説明 */}
              {formData.salesChannel !== 'store' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {formData.salesChannel === 'ec' ? 'ECサイト' : 'イベント出店'}の売上は在庫管理の対象外です。売上データのみ記録されます。
                  </p>
                </div>
              )}

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

                  // 販売チャネルを判定
                  let channelLabel = '';
                  let channelIcon = '';
                  if (sale.locationId === 'ec-site') {
                    channelLabel = 'ECサイト';
                    channelIcon = '🌐';
                  } else if (sale.locationId.startsWith('event-')) {
                    const eventName = sale.locationId.replace('event-', '');
                    channelLabel = `イベント: ${eventName}`;
                    channelIcon = '🎪';
                  } else {
                    channelLabel = location?.name || '不明な販売店';
                    channelIcon = '🏪';
                  }

                  return (
                    <div
                      key={sale.id}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-black">{product?.name || '不明な商品'}</div>
                        <div className="text-sm text-gray-600">{sale.date}</div>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <span>{channelIcon}</span>
                        <span>{channelLabel} / {sale.quantity}個</span>
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
