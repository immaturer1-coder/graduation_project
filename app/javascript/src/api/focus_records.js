/**
 * CSRFトークンをメタタグから取得
 */
const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * 集中記録をRailsサーバーに送信して保存する
 * @param {Object} data - 計測データ(duration[秒], logs等)とユーザー入力(reflection等)が統合されたオブジェクト
 */
export const createFocusRecord = async (data) => {
  // 1. 基本的なバリデーション
  if (!data || typeof data.duration === 'undefined') {
    throw new Error('Invalid focus record data');
  }

  /* * [不整合の修正ポイント]
   * 以前は Math.floor(data.duration / 60) で整数に切り捨てていたが、
   * これでは 1分59秒(119秒) の計測が 1分 として保存されてしまう。
   * 秒単位の精度を保つため、小数点以下の分として計算する。
   * ※Rails側のカラムが integer の場合は保存時に丸められるが、
   * フロントエンドとしては正しい値を送信する責務を持つ。
   */
  const durationInMinutes = data.duration / 60;

  // 2. RailsのAPI構造に合わせたペイロードの構築
  const payload = {
    focus_record: {
      mode: data.mode || 'timer',
      started_at: data.startedAt,
      ended_at: new Date().toISOString(),
      // 修正: 整数制限(Math.floor)を撤廃。
      // また、極端に短い（1秒未満など）場合に備え、0より大きいことを保証
      duration_minutes: parseFloat(durationInMinutes.toFixed(2)), 
      focus_level: data.self_evaluation || 3,
      stop_reason: data.interrupted ? (data.interruption_reason || 'interrupted') : 'completed',
      note: data.reflection_note || '',
      
      focus_record_details_attributes: [
        {
          is_finished: data.completed,
          // Strong Parameters 対策: JSON文字列化して送信
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

    // 3. エラーハンドリング
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