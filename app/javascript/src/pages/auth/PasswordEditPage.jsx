import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PasswordEditPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);

  // 改善点: 初回表示時のみページを強制リロードする（モバイルの縮小バグ対策）
  useEffect(() => {
    // すでにリロード済みかチェック
    const hasReloaded = sessionStorage.getItem('password_page_reloaded');
    
    if (!hasReloaded) {
      // まだリロードしていなければ、フラグを立ててリロード実行
      sessionStorage.setItem('password_page_reloaded', 'true');
      window.location.reload();
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = new URLSearchParams(window.location.search).get('reset_password_token');

    const response = await fetch('/users/password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      },
      body: JSON.stringify({
        user: {
          reset_password_token: token,
          password: password,
          password_confirmation: passwordConfirmation
        }
      })
    });

    const data = await response.json();

    if (response.ok) {
      // 成功時、念のためフラグをクリアしてからリダイレクト
      sessionStorage.removeItem('password_page_reloaded');
      window.location.href = data.redirect_path || '/';
    } else {
      setError(data.errors ? data.errors.join(', ') : t('reset_password_error'));
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center bg-slate-950 p-6 overflow-x-hidden">
      <div className="w-full max-w-sm bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Zap className="text-indigo-400 w-6 h-6" />
          <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">FocusFlow</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-rose-400 text-xs font-bold text-center">{error}</p>}
          <input
            type="password"
            placeholder={t('new_password')}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder={t('confirm_password')}
            className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-indigo-500 transition-all"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          <button className="w-full py-4 mt-2 bg-indigo-600 rounded-xl font-bold text-white text-sm hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/20 active:scale-95">
            {t('update_password_button')}
          </button>
        </form>
      </div>
    </div>
  );
}