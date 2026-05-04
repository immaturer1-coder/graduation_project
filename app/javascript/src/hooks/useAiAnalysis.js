import { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * AI分析レポート生成を管理するカスタムフック
 */
export const useAiAnalysis = () => {
  const [status, setStatus] = useState('idle');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const { i18n } = useTranslation();

  const runAnalysis = async (focusRecordId) => {
    if (!focusRecordId) return;

    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/ai_analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('[name="csrf-token"]')?.content
        },
        body: JSON.stringify({
          focus_record_id: focusRecordId,
          language: i18n.language
        })
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.analysis);
        setStatus('success');
        return data;
      } else {
        throw new Error(data.error || 'ANALYSIS_FAILED');
      }
    } catch (err) {
      console.error('[AI Analysis Error]:', err);
      setError(err.message);
      setStatus('error');
    }
  };

  return { runAnalysis, status, result, error };
};