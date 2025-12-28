'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { Product } from '../../types';

interface Location {
  id: string;
  name: string;
  type: string;
}

interface InventoryItem {
  id: string;
  locationId: string;
  locationName: string;
  productId: string;
  productName: string;
  stock: number;
}

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ locationId: '', productId: '', stock: 0 });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    if (!db) return;

    try {
      const [inventorySnap, productsSnap, locationsSnap] = await Promise.all([
        getDocs(collection(db, 'inventory')),
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'locations')),
      ]);

      const productsData = productsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      const locationsData = locationsSnap.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        type: doc.data().type,
      }));

      const inventoryData = inventorySnap.docs.map((doc) => {
        const data = doc.data();
        const product = productsData.find((p) => p.id === data.productId);
        const location = locationsData.find((l) => l.id === data.locationId);

        return {
          id: doc.id,
          locationId: data.locationId,
          locationName: location?.name || '不明',
          productId: data.productId,
          productName: product?.name || '不明',
          stock: data.stock,
        };
      });

      setInventory(inventoryData);
      setProducts(productsData);
      setLocations(locationsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStock(id: string) {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'inventory', id), {
        stock: editStock,
        lastUpdated: new Date(),
      });

      setInventory(
        inventory.map((item) =>
          item.id === id ? { ...item, stock: editStock } : item
        )
      );
      setEditingId(null);
      alert('在庫を更新しました');
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('在庫の更新に失敗しました');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この在庫アイテムを削除しますか？')) return;
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'inventory', id));
      setInventory(inventory.filter((item) => item.id !== id));
      alert('在庫アイテムを削除しました');
    } catch (error) {
      console.error('Error deleting inventory:', error);
      alert('削除に失敗しました');
    }
  }

  async function handleAddInventory() {
    if (!db || !newItem.locationId || !newItem.productId) {
      alert('販売場所と商品を選択してください');
      return;
    }

    const inventoryId = `${newItem.locationId}_${newItem.productId}`;

    // 既存チェック
    if (inventory.some((item) => item.id === inventoryId)) {
      alert('この組み合わせの在庫は既に存在します');
      return;
    }

    try {
      await setDoc(doc(db, 'inventory', inventoryId), {
        locationId: newItem.locationId,
        productId: newItem.productId,
        stock: newItem.stock,
        lastUpdated: new Date(),
      });

      await fetchData();
      setShowAddModal(false);
      setNewItem({ locationId: '', productId: '', stock: 0 });
      alert('在庫を追加しました');
    } catch (error) {
      console.error('Error adding inventory:', error);
      alert('在庫の追加に失敗しました');
    }
  }

  // 販売場所ごとにグループ化
  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.locationName]) {
      acc[item.locationName] = [];
    }
    acc[item.locationName].push(item);
    return acc;
  }, {} as Record<string, InventoryItem[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b2635] mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">在庫管理</h1>
          <p className="text-gray-600">販売場所ごとの在庫を管理します</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#8b2635] hover:bg-[#6d1d28] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + 在庫を追加
        </button>
      </div>

      {/* 在庫一覧 */}
      <div className="space-y-6">
        {Object.entries(groupedInventory).map(([locationName, items]) => (
          <div
            key={locationName}
            className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800">{locationName}</h2>
              <p className="text-sm text-gray-600">{items.length}商品</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      商品名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      在庫数
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-800">
                          {item.productName}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {editingId === item.id ? (
                          <input
                            type="number"
                            value={editStock}
                            onChange={(e) => setEditStock(Number(e.target.value))}
                            className="w-24 px-3 py-1 border border-gray-300 rounded text-sm text-gray-900"
                            min="0"
                          />
                        ) : (
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                              item.stock > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {item.stock}個
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {editingId === item.id ? (
                          <>
                            <button
                              onClick={() => handleUpdateStock(item.id)}
                              className="text-green-600 hover:text-green-800 font-medium text-sm"
                            >
                              保存
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                            >
                              キャンセル
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(item.id);
                                setEditStock(item.stock);
                              }}
                              className="text-[#8b2635] hover:text-[#6d1d28] font-medium text-sm"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-800 font-medium text-sm"
                            >
                              削除
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* 在庫追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">在庫を追加</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  販売場所
                </label>
                <select
                  value={newItem.locationId}
                  onChange={(e) => setNewItem({ ...newItem, locationId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">選択してください</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  商品
                </label>
                <select
                  value={newItem.productId}
                  onChange={(e) => setNewItem({ ...newItem, productId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="">選択してください</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  在庫数
                </label>
                <input
                  type="number"
                  value={newItem.stock}
                  onChange={(e) => setNewItem({ ...newItem, stock: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddInventory}
                className="flex-1 bg-[#8b2635] hover:bg-[#6d1d28] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ locationId: '', productId: '', stock: 0 });
                }}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
