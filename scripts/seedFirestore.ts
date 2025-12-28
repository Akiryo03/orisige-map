import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { products } from '../app/data/products';
import { locations } from '../app/data/locations';
import { inventory } from '../app/data/inventory';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyD6Ppgpg616GJ0gmqtsad4IAwvUnvYD0-c",
  authDomain: "orisige-map.firebaseapp.com",
  projectId: "orisige-map",
  storageBucket: "orisige-map.firebasestorage.app",
  messagingSenderId: "546029486160",
  appId: "1:546029486160:web:a99dee3211d42bf577d155"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedFirestore() {
  try {
    console.log('🔥 Firestore初期データ投入を開始します...\n');

    // 1. 商品データの投入
    console.log('📦 商品データを投入中...');
    for (const product of products) {
      await setDoc(doc(db, 'products', product.id), {
        name: product.name,
        category: product.category,
        price: product.price,
        description: product.description,
        imageUrl: product.imageUrl || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✓ ${product.name}`);
    }
    console.log(`✅ ${products.length}件の商品データを投入しました\n`);

    // 2. 販売場所データの投入
    console.log('🏪 販売場所データを投入中...');
    for (const location of locations) {
      await setDoc(doc(db, 'locations', location.id), {
        name: location.name,
        type: location.type,
        address: location.address,
        latitude: location.latitude,
        longitude: location.longitude,
        hours: location.hours || '',
        closedDays: location.closedDays || '',
        phone: location.phone || '',
        website: location.website || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`  ✓ ${location.name}`);
    }
    console.log(`✅ ${locations.length}件の販売場所データを投入しました\n`);

    // 3. 在庫データの投入
    console.log('📊 在庫データを投入中...');
    for (const item of inventory) {
      // 在庫IDは locationId_productId の形式
      const locationId = item.location_id || item.locationId;
      const productId = item.product_id || item.productId;
      const inventoryId = `${locationId}_${productId}`;
      await setDoc(doc(db, 'inventory', inventoryId), {
        locationId: locationId,
        productId: productId,
        stock: item.stock,
        lastUpdated: new Date(),
      });
      console.log(`  ✓ ${inventoryId} (在庫: ${item.stock})`);
    }
    console.log(`✅ ${inventory.length}件の在庫データを投入しました\n`);

    console.log('🎉 すべてのデータ投入が完了しました！');
    process.exit(0);
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// スクリプト実行
seedFirestore();
