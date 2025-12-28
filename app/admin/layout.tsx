'use client';

import { AuthProvider, ProtectedRoute, useAuth } from '../lib/auth-context';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // ログインページの場合は、サイドバーなしのレイアウト
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const navItems = [
    { href: '/admin', label: 'ダッシュボード', icon: '📊' },
    { href: '/admin/inventory', label: '在庫管理', icon: '📦' },
    { href: '/admin/locations', label: '販売場所管理', icon: '🏪' },
    { href: '/admin/products', label: '商品管理', icon: '🎁' },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#8b2635]">
                  orisige 管理画面
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  販売店マップ管理システム
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <button
                  onClick={logout}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
                >
                  ログアウト
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* サイドバー */}
            <aside className="lg:col-span-3">
              <nav className="bg-white rounded-xl shadow-md border border-gray-200 p-4 sticky top-24">
                <ul className="space-y-2">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                            isActive
                              ? 'bg-[#8b2635] text-white'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-lg">{item.icon}</span>
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>

                {/* ユーザーサイトへのリンク */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <span className="text-lg">🌐</span>
                    <span>サイトを表示</span>
                  </Link>
                </div>
              </nav>
            </aside>

            {/* メインコンテンツ */}
            <main className="lg:col-span-9">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
