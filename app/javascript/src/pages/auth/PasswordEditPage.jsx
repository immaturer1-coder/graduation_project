import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PasswordEditPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState(null);

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
      // サーバーから返却された redirect_path を使用して遷移
      window.location.href = data.redirect_path || '/';
    } else {
      setError(data.errors ? data.errors.join(', ') : t('reset_password_error'));
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-slate-900 p-8 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <Zap className="text-indigo-400" />
          <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">FocusFlow</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-rose-400 text-xs font-bold">{error}</p>}
          <input
            type="password"
            placeholder={t('new_password')}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder={t('confirm_password')}
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-white"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />
          <button className="w-full py-3 bg-indigo-600 rounded-lg font-bold text-white hover:bg-indigo-500 transition-colors">
            {t('update_password_button')}
          </button>
        </form>
      </div>
    </div>
  );
}