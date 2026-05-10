// 共通設定済みの axiosInstance をインポート
import axiosInstance from '../utils/axios';

/**
 * 集中記録に関する API 通信を管理するモジュール
 */

/**
 * 全件取得
 */
export const fetchFocusRecords = async () => {
  const response = await axiosInstance.get('/api/focus_records');
  return response.data;
};

/**
 * 詳細取得
 */
export const fetchOneFocusRecord = async (id) => {
  const response = await axiosInstance.get(`/api/focus_records/${id}`);
  return response.data;
};

/**
 * 集中記録を Rails サーバーに送信して保存する
 */
export const createFocusRecord = async (data) => {
  if (!data || typeof data.duration === 'undefined') {
    throw new Error('Invalid focus record data');
  }

  // 秒を分に変換 (Rails 側の duration_minutes 用)
  const durationInMinutes = data.duration / 60;

  // ペイロードの構築
  const payload = {
    focus_record: {
      mode: data.mode || 'timer',
      started_at: data.startedAt,
      ended_at: new Date().toISOString(),
      duration_minutes: parseFloat(durationInMinutes.toFixed(2)), 
      focus_level: data.focus_level || 0,
      evaluation: data.evaluation || data.self_evaluation || 3,
      stop_reason: data.stop_reason || data.interruption_reason || (data.interrupted ? 'interrupted' : 'completed'),
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
    const response = await axiosInstance.post('/api/focus_records', payload);
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.errors 
      ? (Array.isArray(error.response.data.errors) ? error.response.data.errors.join(', ') : JSON.stringify(error.response.data.errors))
      : (error.response?.data?.message || error.message || 'Server error occurred');
    
    console.error('[API Error] Focus record creation failed:', errorMessage);
    throw new Error(errorMessage);
  }
};

/**
 * AI分析の実行
 */
export const analyzeFocusRecord = async (id) => {
  const response = await axiosInstance.post(`/api/ai_analysis/${id}`);
  return response.data;
};

/**
 * 振り返りの更新
 */
export const updateFocusRecord = async (id, data) => {
  const payload = { focus_record: data };
  const response = await axiosInstance.patch(`/api/focus_records/${id}`, payload);
  return response.data;
};

/**
 * 削除
 */
export const deleteFocusRecord = async (id) => {
  const response = await axiosInstance.delete(`/api/focus_records/${id}`);
  return response.data;
};

// 互換性のため、オブジェクトにまとめたデフォルトエクスポートも維持します
const focusRecordsApi = {
  fetchAll: fetchFocusRecords,
  fetchOne: fetchOneFocusRecord,
  create: createFocusRecord,
  analyze: analyzeFocusRecord,
  update: updateFocusRecord,
  delete: deleteFocusRecord
};

export default focusRecordsApi;