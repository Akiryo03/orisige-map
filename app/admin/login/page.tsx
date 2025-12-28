'use client';

import { useState } from 'react';
import { useAuth } from '../../lib/auth-context';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('メールアドレスまたはパスワードが正しくありません');
      } else if (err.code === 'auth/invalid-email') {
        setError('有効なメールアドレスを入力してください');
      } else if (err.code === 'auth/too-many-requests') {
        setError('ログイン試行回数が多すぎます。しばらく待ってから再度お試しください');
      } else {
        setError('ログインに失敗しました。もう一度お試しください');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#8b2635] mb-2">
            orisige
          </h1>
          <p className="text-gray-600">管理画面</p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
            ログイン
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                メールアドレス
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent transition-all text-gray-900"
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            {/* パスワード */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                パスワード
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b2635] focus:border-transparent transition-all text-gray-900"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#8b2635] hover:bg-[#6d1d28] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ログイン中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* フッター */}
          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <a
              href="/"
              className="text-sm text-gray-600 hover:text-[#8b2635] transition-colors"
            >
              ← サイトに戻る
            </a>
          </div>
        </div>

        {/* セキュリティノート */}
        <p className="text-center text-xs text-gray-500 mt-6">
          管理者のみがアクセスできます
        </p>
      </div>
    </div>
  );
}
