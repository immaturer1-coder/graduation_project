import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Smartphone,
  Bell,
  ShieldCheck,
  Zap,
  Monitor,
  Info,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';
import Toast from '../../components/ui/Toast';
import { useNotification } from '../../hooks/useNotification';

// ActionCable接続ヘルパーのインポート
import { getConsumer } from '../../utils/cable';

/**
 * PcLinkPage: PC&スマホ連携待機画面＆通知機能バージョン（ActionCable同期およびOS通知強制連動版）
 */
const PcLinkPage = () => {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [toast, setToast] = useState(null);

  // スマホ連動のリアルタイム通信ステータス
  const [isSyncFocusing, setIsSyncFocusing] = useState(false); // スマホが現在裏返し集中中か
  const [syncSessionData, setSyncSessionData] = useState(null); // 同期された時間等の設定情報
  const [isPcLinked, setIsPcLinked] = useState(false); // 【修正】PC連携ステータス管理
  const isPcLinkedRef = useRef(false); // 【新規追加】クロージャのStale State対策として常に最新値を保持

  const channelRef = useRef(null);
  const { permission, requestPermission, sendNotification } = useNotification();
  const isPermissionGranted = permission === 'granted';

  useEffect(() => {
    // 簡易的なモバイル判定
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (/android|iPad|iPhone|iPod/i.test(userAgent)) {
      setIsMobile(true);
    }
  }, []);

  // --- ActionCableによるリアルタイム双方向連携の購読・受信処理 ---
  useEffect(() => {
    const consumer = getConsumer();
    if (consumer) {
      channelRef.current = consumer.subscriptions.create(
        { channel: 'FocusSessionChannel' },
        {
          connected() {
            console.log('[WebSocket] Connected to FocusSessionChannel');
          },
          disconnected() {
            console.log('[WebSocket] Disconnected from FocusSessionChannel');
            setIsSyncFocusing(false);
            setIsPcLinked(false);
            isPcLinkedRef.current = false;
          },
          received(data) {
            console.log('[WebSocket] Received broadcast message:', data);

            // received 内のイベント処理を修正
            if (data.event === 'sync_status') {
              console.log('[WebSocket] Sync status updated:', data.payload);
              setIsPcLinked(data.payload.is_linked);
              isPcLinkedRef.current = data.payload.is_linked;
              return;
            }

            // PCが未連携の場合は、そもそも通知ロジックを動かさないガード
            if (!isPcLinkedRef.current && data.event !== 'sync_status') {
              console.log('[WebSocket] Ignoring event due to PC not linked');
              return;
            }

            // 以下PC側でのみ動作させる通知ロジック（isMobile判定によるガード）
            if (isMobile) return;

            if (data.event === 'start_focus') {
              // スマホが裏返されて集中がスタートした瞬間
              setIsSyncFocusing(true);
              setSyncSessionData(data.payload);

              // セッション途中の「再開」時は通知をスキップし、初回の計測開始時のみバナーとトーストを起動する
              if (!data.payload?.is_resume) {
                const titleText = t('pc_sync_started', '集中ルーティンが開始されました。作業に没頭しましょう！');

                // OSデスクトップ通知の強制発火
                sendNotification(titleText, {
                  body: data.payload?.mode === 'timer' ? '目標タイマー作動中' : '無制限集中モード計測中',
                  tag: 'focus-sync-start'
                });

                // インアプリトーストも同時に発光表示
                showToast(titleText, 'success');
              } else {
                console.log('[WebSocket] Resume detected. Skipping start notifications.');
              }

            } else if (data.event === 'end_focus') {
              // スマホが表に戻された、またはセッションを完了した瞬間
              setIsSyncFocusing(false);
              setSyncSessionData(null);

              // 3秒ルール（一時的な警告）の時は通知をスキップし、
              // 内省画面への移行など「真のセッション終了 (completed)」の時だけ終了バナーとトーストを起動する
              if (data.payload?.stop_reason === 'completed') {
                sendNotification('集中ルーティンが終了しました', {
                  body: 'スマートフォンが元に戻されました。内省を入力してください。',
                  tag: 'focus-sync-end'
                });

                showToast('集中ルーティンが終了しました。お疲れ様でした！', 'info');
              } else {
                console.log('[WebSocket] Interrupted (3-second warning). Skipping end notifications.');
              }

            } else if (data.event === 'recommend_milestone') {
              // ①【マイルストーン通知】スマホ側で30秒（本番45分）経過した瞬間
              console.log('[WebSocket] Received recommend_milestone');

              // OS通知ポップアップ（画面の裏側でも絶対に見逃さない）
              sendNotification('45分経過しました。素晴らしい集中です！ 🎉', {
                body: '適宜ストレッチをして姿勢をリフレッシュしましょう。',
                tag: 'focus-milestone',
                requireInteraction: true // ユーザーが閉じるまでバナーを維持
              });

              // 画面上にもトーストを表示
              showToast('45分経過しました。素晴らしい集中です！ 🎉', 'success');

            } else if (data.event === 'recommend_break') {
              // ②【休憩レコメンド通知】スマホ側で60秒（本番90分）経過した瞬間
              console.log('[WebSocket] Received recommend_break');

              // OS通知ポップアップ
              sendNotification('お疲れ様でした。長時間集中しましたね、少し休憩しませんか？ ☕', {
                body: '水分を摂り、一度深く呼吸をしてみましょう。',
                tag: 'focus-break-recommend',
                requireInteraction: true // ユーザーが閉じるまでバナーを維持
              });

              // 画面上にも表示して休憩を促す（warningタイプでエキサイティングに発光）
              showToast('お疲れ様でした。長時間集中しましたね、少し休憩しませんか？ ☕', 'warning');
            }
          }
        }
      );
    }

    // アンマウント時に購読解除
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        console.log('[WebSocket] Unsubscribed from FocusSessionChannel');
      }
    };
  }, [isMobile, sendNotification, t]);

  useEffect(() => {
    if (isPermissionGranted && !isSyncFocusing) {
      showToast(t('pc_link_ready_sync'), 'success');
    }
  }, [isPermissionGranted, isSyncFocusing, t]);

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      // 許可されたらウェルカム通知を送信
      sendNotification(t('pc_link_ready_sync'), {
        body: t('pc_link_step_flip_desc'),
        tag: 'welcome-sync'
      });
      showToast(t('pc_link_ready_sync'), 'success');
    } else if (result === 'denied') {
      showToast('Notification is blocked. Please allow it in browser settings.', 'error');
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // コピー処理
  const handleCopyUrl = () => {
    const pcUrl = "https://focusflow-73hm.onrender.com/";
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      navigator.clipboard.writeText(pcUrl).then(() => {
        showToast('URLをコピーしました！', 'success');
      }).catch(err => {
        fallbackCopy(pcUrl);
      });
    } else {
      fallbackCopy(pcUrl);
    }
  };

  // コピー処理フォールバック用従来手法
  const fallbackCopy = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showToast('URLをコピーしました！', 'success');
  };

  // 📱スマホで見たときのUI
  if (isMobile) {
    return (
      <div className="flex flex-col items-center min-h-screen px-6 bg-slate-950 text-slate-100 select-none overflow-y-auto pb-10 font-sans">
        {/* 通常のトースト表示（コピー通知以外） */}
        {toast && toast.message !== 'URLをコピーしました！' && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <div className="w-full max-w-md py-10 space-y-8">

          {/* ヘッダー */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">
              <Info size={12} />
              {t('pc_link_guide_badge')}
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white whitespace-pre-wrap">
              {t('pc_link_title')}
            </h1>
            {/* 【修正】ステータス表示追加 */}
            <div className={`mt-2 text-xs font-bold ${isPcLinked ? 'text-emerald-400' : 'text-slate-500'}`}>
              {isPcLinked ? '● PC連携中' : '○ PC未連携'}
            </div>
          </div>

          {/* ガイドセクション */}
          <div className="space-y-4">
            <Card className="bg-slate-900 border-slate-800 p-4 space-y-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <Monitor size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-none">{t('pc_link_step1_title')}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed break-words">
                    {t('pc_link_step1_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <Bell size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-none">{t('pc_link_step2_title')}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed break-words">
                    {t('pc_link_step2_desc')}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2.5 bg-indigo-500/20 rounded-xl text-indigo-400 shrink-0">
                  <Smartphone size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white leading-none">{t('pc_link_step3_title')}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed break-words">
                    {t('pc_link_step3_desc')}
                  </p>
                </div>
              </div>
            </Card>

            {/* メリット紹介 */}
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Benefit</p>
                <p className="text-xs font-bold text-slate-200">{t('pc_link_benefit')}</p>
              </div>
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Zap size={16} className="text-indigo-400" />
              </div>
            </div>
          </div>

          {/* URLコピーセクション */}
          <div className="pt-2 space-y-3">
            {/* コピー通知のスマホ専用インライン表示（ボタンの真上に出現させて視認性を100%確保） */}
            {toast && toast.message === 'URLをコピーしました！' && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between gap-3 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span className="text-[11px] font-black tracking-wider">{toast.message}</span>
                  </div>
                  <button
                    onClick={() => setToast(null)}
                    className="text-[10px] text-emerald-400/60 hover:text-emerald-400 font-bold uppercase tracking-wider"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleCopyUrl}
              className="w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-between active:bg-indigo-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <ExternalLink size={16} className="text-indigo-400" />
                <div className="text-left">
                  <p className="text-xs font-bold text-slate-300">{t('pc_link_copy_url')}</p>
                  <p className="text-[9px] text-slate-500 font-medium">https://focusflow-73hm.onrender.com/</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600" />
            </button>
          </div>

          <p className="text-center text-[10px] text-slate-600 font-medium px-4 leading-relaxed whitespace-pre-wrap">
            {t('pc_link_footer_note')}
          </p>
        </div>
      </div>
    );
  }

  // 🖥️ PC環境での同期中（スマホ裏返し状態）の「トースト通知UI」
  if (isSyncFocusing) {
    return (
      <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-8 select-none z-[999] animate-in fade-in duration-700">
        {/* 背景のグローサークルエフェクト */}
        <div className="absolute inset-0 bg-indigo-950/20 blur-[120px] rounded-full" />

        <div className="w-full max-w-md text-center space-y-10 relative">

          {/* 同期中インアプリトースト通知 */}
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
            />
          )}

          {/* 没頭を象徴する物理スマホデバイス性能反転アニメーション */}
          <div className="flex justify-center">
            <div className="p-8 bg-slate-900/60 border border-indigo-500/30 rounded-full shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-pulse">
              <Smartphone size={64} className="text-indigo-400 rotate-180 transition-transform duration-700" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">
              {t('pc_active_title', 'Focus Active')}
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed font-bold tracking-[0.2em] uppercase">
              {syncSessionData?.mode === 'timer'
                ? t('pc_active_timer_sub', 'Timer Mode Synchronized')
                : t('pc_active_unlimited_sub', 'Unlimited Focus Synchronized')}
            </p>
          </div>

          <Card className="bg-slate-900/40 border-slate-800/40 p-6 flex flex-col items-center justify-center gap-1">
            <span className="text-[10px] text-slate-500 font-black tracking-widest uppercase">
              {t('pc_active_state_label', 'Target Focus State')}
            </span>
            <div className="text-lg font-black text-emerald-400 flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{t('pc_active_flow_state', 'IN FLOW STATE')}</span>
            </div>
          </Card>

          <p className="text-xs text-slate-600 font-bold tracking-widest uppercase animate-pulse">
            {t('pc_active_instruction', 'Keep your phone face down on your desk.')}
          </p>
        </div>
      </div>
    );
  }

  // 🖥️ PC側の初期待機状態のUI (非同期中)
  return (
    <div className="flex flex-col items-center min-h-screen px-6 bg-slate-950 text-slate-100 select-none font-sans relative">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="w-full max-w-md flex-grow flex flex-col justify-center py-12 space-y-8 text-center">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <Zap size={12} />
            {isPermissionGranted ? t('pc_link_ready_sync') : t('pc_link_waiting_link')}
          </div>
        </div>

        {/* 接続アニメーションセクション */}
        <div className="relative flex justify-center py-6">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full" />
          <div className="relative flex items-center gap-6">
            <div className="p-5 bg-slate-900 border border-indigo-500 rounded-3xl shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Monitor size={48} className="text-indigo-400" />
            </div>
            <div className="flex flex-col gap-1 items-center">
              <div className={`w-10 h-[2px] rounded-full transition-all duration-1000 ${isPermissionGranted ? 'bg-indigo-500 opacity-100' : 'bg-slate-800 opacity-30'}`} />
              <div className={`w-6 h-[2px] rounded-full transition-all duration-1000 delay-150 ${isPermissionGranted ? 'bg-indigo-500 opacity-100' : 'bg-slate-800 opacity-30'}`} />
            </div>
            <div className={`p-5 bg-slate-900 border transition-all duration-700 rounded-3xl shadow-2xl ${isPermissionGranted ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.35)]' : 'border-slate-800 shadow-none'}`}>
              <Smartphone size={48} className={`transition-colors duration-700 ${isPermissionGranted ? 'text-indigo-400' : 'text-slate-600'}`} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tighter text-white leading-tight whitespace-pre-wrap">
            {t('pc_link_pc_main_title')}
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-[280px] mx-auto font-medium whitespace-pre-wrap">
            {t('pc_link_pc_main_desc')}
          </p>
        </div>

        {/* タイムライン表示 */}
        <Card className="bg-slate-900/50 border-slate-800/50 text-left p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${isPermissionGranted ? 'bg-emerald-500' : 'bg-indigo-600'}`}>
              {isPermissionGranted ? '✓' : '1'}
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{t('pc_link_step_allow_title')}</p>
              <p className="text-[11px] text-slate-500 mt-1">{t('pc_link_step_allow_desc')}</p>
            </div>
          </div>
          <div className={`flex items-start gap-4 transition-opacity duration-500 ${isPermissionGranted ? 'opacity-100' : 'opacity-30'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5 ${isPermissionGranted ? 'bg-indigo-600' : 'bg-slate-700'}`}>2</div>
            <div>
              <p className={`text-xs font-bold uppercase tracking-wider ${isPermissionGranted ? 'text-white' : 'text-slate-400'}`}>{t('pc_link_step_flip_title')}</p>
              <p className={`text-[11px] mt-1 ${isPermissionGranted ? 'text-slate-400' : 'text-slate-600'}`}>{t('pc_link_step_flip_desc')}</p>
            </div>
          </div>
        </Card>

        {/* アクションボタン */}
        <div className="space-y-4 pb-8">
          {!isPermissionGranted ? (
            <div className="space-y-3">
              <PrimaryButton
                onClick={handleRequestPermission}
                className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 group transition-transform active:scale-95"
              >
                <Bell size={18} className="group-hover:animate-bounce" />
                {t('pc_link_btn_allow')}
              </PrimaryButton>
              {permission === 'denied' && (
                <p className="text-[10px] text-red-400 font-bold">
                  Notification is blocked. Please allow it in browser settings.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in zoom-in duration-500">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 py-4 rounded-xl border border-emerald-500/20">
                <ShieldCheck size={20} />
                {t('pc_link_ready_status')}
              </div>
              <div className="flex flex-col items-center">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em] animate-pulse">
                  {t('pc_link_waiting_flip')}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PcLinkPage;