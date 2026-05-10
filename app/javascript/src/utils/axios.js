// 外部ライブラリの axios をインポート
import axios from 'axios';

/**
 * APIリクエストの共通インスタンス
 */
const axiosInstance = axios.create({
  // セッションCookie（CSRFトークン含む）を自動送信するために必須
  withCredentials: true,
});

/**
 * リクエスト・インターセプター
 * 送信直前にブラウザのクッキーから CSRF トークンを抽出し、ヘッダーに付与します
 */
axiosInstance.interceptors.request.use((config) => {
  // クッキーから特定の名前の値を取得するヘルパー
  const getCookieValue = (name) => {
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[2]) : null;
  };

  // ApplicationController で設定された 'CSRF-TOKEN' を取得
  const csrfToken = getCookieValue('CSRF-TOKEN');

  if (csrfToken) {
    // Rails の protect_from_forgery が検証に使用する標準ヘッダー名
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;