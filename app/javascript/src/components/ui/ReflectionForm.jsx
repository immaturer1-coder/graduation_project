import React, { useState, useRef } from 'react';
import { MessageSquare, Save, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ReflectionForm = ({ isCompleted, totalSeconds, onSubmit }) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lockRef = useRef(false);

  const [evaluation, setEvaluation] = useState(3);
  const [reason, setReason] = useState(isCompleted ? 'session_completed' : '');
  const [note, setNote] = useState('');

  const emojis = [
    { value: 1, char: '😫', label: 'evaluation_worst' },
    { value: 2, char: '😕', label: 'evaluation_poor' },
    { value: 3, char: '😐', label: 'evaluation_neutral' },
    { value: 4, char: '😊', label: 'evaluation_good' },
    { value: 5, char: '🤩', label: 'evaluation_amazing' },
  ];

  const interruptionReasons = [
    { key: 'reason_notifications' },
    { key: 'reason_phone_call' },
    { key: 'reason_involuntary' },
    { key: 'reason_external_noise' },
    { key: 'reason_fatigue' },
    { key: 'reason_other' }
  ];

  const handleSubmit = async (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    
    if (isSubmitting || lockRef.current) return false;

    lockRef.current = true; 
    setIsSubmitting(true);

    try {
      await onSubmit({
        self_evaluation: evaluation,
        interruption_reason: isCompleted ? 'Completed' : reason,
        reflection_note: note,
        actual_duration: totalSeconds
      });
    } catch (error) {
      console.error("Failed to save reflection:", error);
      lockRef.current = false;
      setIsSubmitting(false);
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-hidden">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-full max-h-[90vh] animate-in fade-in zoom-in duration-300">
        
        {/* Header - コンパクト化 */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight italic uppercase">
              {t('reflection_title')}
            </h2>
            <p className="text-slate-500 text-[8px] uppercase tracking-[0.3em] mt-0.5 font-bold">
              {t('reflection_subtitle')}
            </p>
          </div>
        </div>

        {/* Form Body - flex-1 で余白を自動調整し、内部スクロールを禁止 */}
        <div className="flex flex-col flex-1 overflow-hidden p-5 justify-between">
          
          {/* Evaluation Section */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              {t('focus_quality')}
            </label>
            <div className="flex justify-between items-center bg-slate-950/50 p-3 rounded-2xl border border-slate-800/50 shadow-inner">
              {emojis.map((emoji) => (
                <button
                  key={emoji.value}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEvaluation(emoji.value)}
                  className={`flex flex-col items-center gap-1 transition-all duration-300 ${
                    evaluation === emoji.value 
                      ? 'scale-110 filter-none opacity-100' 
                      : 'grayscale opacity-30 hover:opacity-60 scale-100'
                  }`}
                >
                  <span className="text-2xl drop-shadow-md">{emoji.char}</span>
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${evaluation === emoji.value ? 'text-indigo-400' : 'text-slate-600'}`}>
                    {t(emoji.label)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Reason Section */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              {isCompleted ? t('status_label') : t('interruption_reason_label')}
            </label>
            
            {isCompleted ? (
              <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 py-3 px-4 rounded-2xl text-[10px] font-black tracking-widest flex items-center gap-3">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                {t('session_completed')}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {interruptionReasons.map((r) => (
                  <button
                    key={r.key}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setReason(r.key)}
                    className={`py-2.5 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border ${
                      reason === r.key
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                        : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700 hover:text-slate-400'
                    }`}
                  >
                    {t(r.key)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Note Section - 高さを固定しすぎないよう調整 */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
              {t('insights_label')}
            </label>
            <div className="relative group">
              <div className="absolute top-2.5 left-3 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
                <MessageSquare size={12} />
              </div>
              <textarea
                value={note}
                disabled={isSubmitting}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('insights_placeholder')}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-2xl py-2.5 pl-9 pr-4 h-20 focus:outline-none focus:border-indigo-500 transition-all resize-none placeholder:text-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Footer Action - 固定 */}
        <div className="p-5 bg-slate-800/20 border-t border-slate-800 shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={( !isCompleted && !reason ) || isSubmitting}
            className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all ${
              ((!isCompleted && !reason) || isSubmitting)
                ? 'bg-slate-800 text-slate-700 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xl shadow-indigo-500/40 active:scale-[0.97]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {t('analyzing_session')}
              </>
            ) : (
              <>
                <Save size={16} />
                {t('save_analyze')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReflectionForm;