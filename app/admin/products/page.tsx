'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Product } from '../../types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Product>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    category: 'くらし',
    price: 0,
    description: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    if (!db) return;

    try {
      const snap = await getDocs(collection(db, 'products'));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Product[];

      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'products', id), {
        ...editData,
        updatedAt: new Date(),
      });

      setProducts(
        products.map((prod) =>
          prod.id === id ? { ...prod, ...editData } as Product : prod
        )
      );
      setEditingId(null);
      setEditData({});
      alert('更新しました');
    } catch (error) {
      console.error('Error updating product:', error);
      alert('更新に失敗しました');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この商品を削除しますか？関連する在庫データも削除されます。')) return;
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'products', id));
      setProducts(products.filter((prod) => prod.id !== id));
      alert('削除しました');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('削除に失敗しました');
    }
  }

  async function handleAdd() {
    if (!db || !newProduct.name) {
      alert('商品名を入力してください');
      return;
    }

    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await fetchProducts();
      setShowAddModal(false);
      setNewProduct({
        name: '',
        category: 'くらし',
        price: 0,
        description: '',
        imageUrl: '',
      });
      alert('追加しました');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('追加に失敗しました');
    }
  }

  const categories = ['くらし', 'こころ', 'てまひま', 'たべる', 'All ibaraki project'];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(price);
  };

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">商品管理</h1>
          <p className="text-gray-600">商品情報を管理します</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#8b2635] hover:bg-[#6d1d28] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + 商品を追加
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">商品名</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">カテゴリ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">価格</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">説明</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <input
                        type="text"
                        value={editData.name ?? product.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{product.name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <select
                        value={editData.category ?? product.category}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-medium bg-[#8b2635] text-white">
                        {product.category}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editData.price ?? product.price}
                        onChange={(e) => setEditData({ ...editData, price: Number(e.target.value) })}
                        className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{formatPrice(product.price)}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === product.id ? (
                      <textarea
                        value={editData.description ?? product.description}
                        onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                        rows={2}
                      />
                    ) : (
                      <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {editingId === product.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(product.id)}
                          className="text-green-600 hover:text-green-800 font-medium text-sm"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditData({});
                          }}
                          className="text-gray-600 hover:text-gray-800 font-medium text-sm"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setEditingId(product.id);
                            setEditData(product);
                          }}
                          className="text-[#8b2635] hover:text-[#6d1d28] font-medium text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">商品を追加</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">商品名 *</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">価格（円） *</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">説明</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">画像URL</label>
                <input
                  type="url"
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                className="flex-1 bg-[#8b2635] hover:bg-[#6d1d28] text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => setShowAddModal(false)}
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
