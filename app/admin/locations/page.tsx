'use client';

import { useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc } from 'firebase/firestore';

interface Location {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  hours: string;
  closedDays: string;
  phone?: string;
  website?: string;
}

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<Location>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({
    name: '',
    type: 'roadside_station',
    address: '',
    latitude: 0,
    longitude: 0,
    hours: '',
    closedDays: '',
    phone: '',
    website: '',
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    if (!db) return;

    try {
      const snap = await getDocs(collection(db, 'locations'));
      const data = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Location[];

      setLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
      alert('データの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(id: string) {
    if (!db) return;

    try {
      await updateDoc(doc(db, 'locations', id), {
        ...editData,
        updatedAt: new Date(),
      });

      setLocations(
        locations.map((loc) =>
          loc.id === id ? { ...loc, ...editData } as Location : loc
        )
      );
      setEditingId(null);
      setEditData({});
      alert('更新しました');
    } catch (error) {
      console.error('Error updating location:', error);
      alert('更新に失敗しました');
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('この販売場所を削除しますか？関連する在庫データも削除されます。')) return;
    if (!db) return;

    try {
      await deleteDoc(doc(db, 'locations', id));
      setLocations(locations.filter((loc) => loc.id !== id));
      alert('削除しました');
    } catch (error) {
      console.error('Error deleting location:', error);
      alert('削除に失敗しました');
    }
  }

  async function handleAdd() {
    if (!db || !newLocation.name || !newLocation.address) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      await addDoc(collection(db, 'locations'), {
        ...newLocation,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await fetchLocations();
      setShowAddModal(false);
      setNewLocation({
        name: '',
        type: 'roadside_station',
        address: '',
        latitude: 0,
        longitude: 0,
        hours: '',
        closedDays: '',
        phone: '',
        website: '',
      });
      alert('追加しました');
    } catch (error) {
      console.error('Error adding location:', error);
      alert('追加に失敗しました');
    }
  }

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
          <h1 className="text-2xl font-bold text-gray-800 mb-2">販売場所管理</h1>
          <p className="text-gray-600">販売場所の情報を管理します</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#8b2635] hover:bg-[#6d1d28] text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          + 販売場所を追加
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">名称</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">種別</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">住所</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">営業時間</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {editingId === location.id ? (
                      <input
                        type="text"
                        value={editData.name ?? location.name}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    ) : (
                      <p className="text-sm font-medium text-gray-800">{location.name}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === location.id ? (
                      <select
                        value={editData.type ?? location.type}
                        onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                        className="px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      >
                        <option value="roadside_station">道の駅</option>
                        <option value="shrine">神社</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600">
                        {location.type === 'roadside_station' ? '道の駅' : '神社'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingId === location.id ? (
                      <input
                        type="text"
                        value={editData.address ?? location.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-900"
                      />
                    ) : (
                      <p className="text-sm text-gray-600">{location.address}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600">{location.hours}</p>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {editingId === location.id ? (
                      <>
                        <button
                          onClick={() => handleUpdate(location.id)}
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
                            setEditingId(location.id);
                            setEditData(location);
                          }}
                          className="text-[#8b2635] hover:text-[#6d1d28] font-medium text-sm"
                        >
                          編集
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4">販売場所を追加</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">名称 *</label>
                <input
                  type="text"
                  value={newLocation.name}
                  onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">種別 *</label>
                <select
                  value={newLocation.type}
                  onChange={(e) => setNewLocation({ ...newLocation, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                >
                  <option value="roadside_station">道の駅</option>
                  <option value="shrine">神社</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">電話番号</label>
                <input
                  type="text"
                  value={newLocation.phone}
                  onChange={(e) => setNewLocation({ ...newLocation, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">住所 *</label>
                <input
                  type="text"
                  value={newLocation.address}
                  onChange={(e) => setNewLocation({ ...newLocation, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">緯度 *</label>
                <input
                  type="number"
                  step="any"
                  value={newLocation.latitude}
                  onChange={(e) => setNewLocation({ ...newLocation, latitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">経度 *</label>
                <input
                  type="number"
                  step="any"
                  value={newLocation.longitude}
                  onChange={(e) => setNewLocation({ ...newLocation, longitude: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">営業時間</label>
                <input
                  type="text"
                  value={newLocation.hours}
                  onChange={(e) => setNewLocation({ ...newLocation, hours: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="9:00〜17:00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">定休日</label>
                <input
                  type="text"
                  value={newLocation.closedDays}
                  onChange={(e) => setNewLocation({ ...newLocation, closedDays: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                  placeholder="年中無休"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">ウェブサイト</label>
                <input
                  type="url"
                  value={newLocation.website}
                  onChange={(e) => setNewLocation({ ...newLocation, website: e.target.value })}
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
