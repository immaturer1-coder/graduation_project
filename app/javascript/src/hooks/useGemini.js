import { useState, useCallback } from 'react';

/**
 * Railsバックエンドを経由してGemini APIを利用するためのカスタムフック
 */
export const useGemini = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (prompt, systemInstruction = '') => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai_analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        },
        body: JSON.stringify({
          prompt,
          system_instruction: systemInstruction
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // API側からエラーキーが返ればそれを使用し、なければデフォルトを投げる
        throw new Error(data.error || 'ANALYSIS_FAILED');
      }

      return data.analysis;
    } catch (err) {
      // ネットワークエラー等の予期せぬエラー
      const message = err.message || 'UNEXPECTED_ERROR';
      setError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyze,
    isAnalyzing,
    error,
    clearError: () => setError(null)
  };
};