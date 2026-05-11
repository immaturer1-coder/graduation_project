import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { UserPlus, LogIn } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import LPSlideShow from '../../components/ui/LPSlideShow';

/**
 * アプリのランディングページ
 */
const LandingPage = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-between h-[100dvh] w-full text-center p-6 bg-slate-950 overflow-hidden py-8">
      
      {/* ヘッダーセクション（上部に配置） */}
      <div className="w-full">
        <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-2 italic leading-tight">
          FocusFlow
        </h1>
        {/* i18n.js 内の lp_hero_subtitle キーのみを参照するように修正 */}
        <p className="text-slate-400 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
          <Trans i18nKey="lp_hero_subtitle" />
        </p>
      </div>

      {/* スライドショー（中央に配置） */}
      <div className="w-full max-w-sm flex-1 flex items-center justify-center">
        <LPSlideShow />
      </div>

      {/* アクションボタン（下部に配置） */}
      <div className="w-full max-w-xs space-y-3 mt-4">
        <PrimaryButton onClick={() => onNavigate('signup')} icon={UserPlus}>
          {t('get_started')}
        </PrimaryButton>
        <button
          onClick={() => onNavigate('login')}
          className="w-full bg-transparent border border-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
        >
          {t('log_in')} <LogIn size={18} />
        </button>
      </div>
      
    </div>
  );
};

export default LandingPage;