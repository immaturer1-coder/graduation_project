/**
 * CSRFトークンをメタタグから取得
 */
const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * 集中記録をRailsサーバーに送信して保存する
 */
export const createFocusRecord = async (data) => {
  if (!data || typeof data.duration === 'undefined') {
    throw new Error('Invalid focus record data');
  }

  const durationInMinutes = data.duration / 60;

  // RailsのAPI構造に合わせたペイロードの構築
  const payload = {
    focus_record: {
      mode: data.mode || 'timer',
      started_at: data.startedAt,
      ended_at: new Date().toISOString(),
      duration_minutes: parseFloat(durationInMinutes.toFixed(2)), 
      // focus_level はスコア（PTS）
      focus_level: data.focus_level || 0,
      // evaluation は顔文字(1-5)
      evaluation: data.evaluation || data.self_evaluation || 3,
      // 中断理由の判定: ReflectionForm側で詳細が選ばれていればそれを優先
      stop_reason: data.stop_reason || data.interruption_reason || (data.interrupted ? 'interrupted' : 'completed'),
      // メモ
      note: data.note || data.reflection_note || '',
      
      focus_record_details_attributes: [
        {
          is_finished: data.completed,
          motion_logs: JSON.stringify(data.logs || [])
        }
      ]
    }
  };

  try {
    const response = await fetch('/api/focus_records', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-CSRF-Token': getCsrfToken()
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      const errorMessage = result.errors 
        ? (Array.isArray(result.errors) ? result.errors.join(', ') : JSON.stringify(result.errors))
        : (result.message || 'Server error occurred');
      
      throw new Error(errorMessage);
    }

    return result;
  } catch (error) {
    console.error('[API Error] Focus record creation failed:', error);
    throw error;
  }
};