/**
 * Rails APIのセッション関連リクエストを担当するユーティリティ
 */

const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * 集中セッションをRails DBに保存する
 * @param {Object} result - ConcentrationTimerから渡されるデータ
 * @returns {Promise<Object>} APIレスポンス
 */
export const createSession = async (result) => {
  const payload = {
    session: {
      duration: result.duration,
      mode_type: result.mode,
      status: result.completed ? 'completed' : 'interrupted',
      motion_logs: result.logs
    }
  };

  const response = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to save session');
  }

  return await response.json();
};