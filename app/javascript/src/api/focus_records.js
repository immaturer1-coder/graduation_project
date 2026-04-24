/**
 * FocusRecord 関連のリクエストを担当するユーティリティ
 */

const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * 集中記録を保存する
 * @param {Object} result - タイマーから渡されるセッション結果
 */
export const createFocusRecord = async (result) => {
  // Rails側の accepts_nested_attributes_for :focus_record_detail に合わせた構造
  const payload = {
    focus_record: {
      mode: result.mode,
      duration_minutes: Math.floor(result.duration / 60), // 秒を分に変換
      stop_reason: result.interrupted ? 'interrupted' : 'completed',
      // 1対1のリレーション先（FocusRecordDetail）のデータ
      focus_record_detail_attributes: {
        is_finished: result.completed,
        motion_logs: result.logs
      }
    }
  };

  const response = await fetch('/api/focus_records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors?.join(', ') || 'Failed to save record');
  }

  return await response.json();
};