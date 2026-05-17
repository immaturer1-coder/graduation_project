import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * 画面上のすべてのテキストの翻訳リソース
 */
const resources = {
  ja: {
    translation: {
      // ナビゲーションラベル
      "nav_timer": "タイマー",
      "nav_analysis": "分析",
      "nav_history": "履歴",
      "nav_settings": "設定",
      "nav_logout": "ホーム",

      // ランディングページ
      "lp_hero_subtitle": "スマートフォンの「裏返し」をスイッチに、<br />深い集中状態へのルーティンを。",
      "get_started": "はじめる",
      "log_in": "ログイン",
      "lp_slide_1": {
        "title": "1. タイマー設定",
        "description": "集中したい目標時間をセット。無理のない範囲から始めましょう。"
      },
      "lp_slide_2": {
        "title": "2. スマホを裏返す",
        "description": "デバイスを置いた瞬間、計測スタート。通知を遮断し、自分だけの時間へ。"
      },
      "lp_slide_3": {
        "title": "3. AIが分析",
        "description": "高度なセンサー解析で集中の深さを可視化。AIがあなたの質を評価します。"
      },
      "lp_slide_4": {
        "title": "4. ルーティンへ",
        "description": "日々の集中を記録し、最適な作業リズムを構築。理想の習慣を手に入れよう。"
      },

      // ヘッダー・タイトル
      "back": "戻る",
      "create_account": "アカウント作成",
      "welcome_back": "おかえりなさい",
      "reset_password_title": "パスワードの再設定",
      "reset_password_description": "ご登録のメールアドレスを入力してください。再設定用の手順をお送りします。",

      // タイマー・集中関連
      "select_mode": "モードを選択",
      "timer_mode": "タイマーモード",
      "timer_mode_sub": "目標時間を設定",
      "focus_mode": "集中モード",
      "focus_mode_sub": "無制限に計測",
      "start_session": "計測開始",
      "hrs": "時",
      "min": "分",
      "status_focusing_msg": "集中計測中...",
      "status_complete_msg": "目標達成！端末を戻してください",

      // PC連携 (PcLinkPage)
      "pc_link_guide_badge": "PC連携ガイド",
      "pc_link_title": "PCと一緒に使う",
      "pc_link_step1_title": "PCでサイトを開く",
      "pc_link_step1_desc": "ブラウザで FocusFlow のURLにアクセスし、ログインします。",
      "pc_link_step2_title": "通知を許可する",
      "pc_link_step2_desc": "PC側で「通知の許可」を求められたら「許可」を選択してください。",
      "pc_link_step3_title": "スマホを裏返す",
      "pc_link_step3_desc": "準備ができたらスマホを裏返します。PC画面が自動で切り替わります。",
      "pc_link_benefit": "PC作業中の集中を妨げないシームレスな体験",
      "pc_link_copy_url": "PC用URLをコピー",
      "pc_link_footer_note": "※同一アカウントでログインする必要があります。\nブラウザの通知設定がONであることを\n確認してください。",
      "pc_link_ready_sync": "同期の準備完了",
      "pc_link_waiting_link": "連携を待機中",
      "pc_link_pc_main_title": "PCとの連携設定",
      "pc_link_pc_main_desc": "スマートフォンを裏返すだけで、PC画面を集中モードへ切り替えます。",
      "pc_link_step_allow_title": "通知の許可",
      "pc_link_step_allow_desc": "ブラウザの通知を許可してください。",
      "pc_link_step_flip_title": "スマホを裏返す",
      "pc_link_step_flip_desc": "準備完了。スマホを裏返すと同期が始まります。",
      "pc_link_btn_allow": "通知を許可して待機する",
      "pc_link_ready_status": "連携準備が完了しました",
      "pc_link_waiting_flip": "スマホの裏返しを待機中...",
      "pc_linked": "PC連携中 ",
      "pc_unlinked": "PC未連携 ",

      // センサーエンジン (FocusDetectionEngine)
      "engine_capabilities": {
        "hero_title_part1": "集中",
        "hero_title_part2": "支援機能",
        "hero_subtitle": "集中を科学する、4つのコア・テクノロジー",
        "slide1_desc": "ポモドーロ・テクニックに基づいた最適なサイクルで、脳のパフォーマンスを最大化します。",
        "slide2_desc": "スマホを裏返す。その物理的なスイッチが、あなたの集中モードを起動します。",
        "slide3_desc": "通知を遮断し、シングルタスクに没頭するための科学的なアプローチを提供。",
        "slide4_desc": "PCとスマホが連携。集中が途切れる隙を与えない、シームレスな体験。",
        "sensor_desc": "スマートフォンのジャイロセンサーを利用して、デバイスの反転状態をリアルタイムに検知します。",
        "btn_init": "エンジンを起動する",
        "status_focused": "集中状態",
        "status_standby": "待機中",
        "algo_active": "検知アルゴリズム作動中"
      },

      "warning_title": "スマホを裏返して\nください！",
      "warning_subtitle": "{{count}}秒後に終了...",
      "engine_status_active": "計測中",
      "instruction_flip_to_start": "スマホを裏返すと\n計測開始",

      // 履歴一覧
      "history_title": "履歴一覧",
      "loading_logs": "ログを読み込み中...",
      "no_sessions": "セッション履歴がありません",

      // 分析・履歴詳細 
      "focus_report_header": "集中レポート詳細",
      "detail_mode_label": "計測モード",
      "detail_timer_label": "タイマー",
      "detail_focus_label": "集中",
      "focus_stability": "集中推移グラフ",
      "score": "スコア",
      "user_reflection": "振り返りメモ",
      "no_motion_data": "モーションデータがありません",
      "generating_chart": "グラフを生成中...",
      "no_analysis_data": "解析データ待ち、または短いセッションのため解析をスキップしました。",
      "no_reflection": "記録されたメモはありません",
      "ai_analysis": "AI 解析レポート",

      // 分析画面 
      "analysis_title": "分析レポート",
      "coming_soon_graph": "集中推移グラフ (準備中)",
      "ai_advisor_label": "AI アドバイザー",
      "score_label": "スコア",
      "focus_time_label": "集中時間",
      "analysis_loading": "AIが集中データを解析中...",
      "analysis_server_error": "サーバーエラーが発生しました。時間を置いて再度お試しください。",
      "analysis_waiting": "解析結果を待機中...",

      // ログ・グラフ用 (FocusChart)
      "logs": {
        "focus_level": "集中度",
        "focus_trend": "集中度の推移",
        "no_data": "ログデータがありません"
      },

      // ラベル
      "user_name": "ユーザー名",
      "email": "メールアドレス",
      "email_address": "メールアドレス",
      "password": "パスワード",
      "confirm_password": "パスワード（確認用）",

      // プレースホルダー
      "placeholder_user": "ユーザー名を入力",
      "placeholder_email": "メールアドレスを入力",

      // ボタン・リンク
      "sign_up": "新規登録",
      "sign_in": "ログイン",
      "forgot_password": "パスワードをお忘れですか？",
      "dont_have_account": "アカウントをお持ちでないですか？",
      "send_instructions": "再設定メールを送信",
      "back_to_login": "ログインに戻る",
      "sending": "送信中...",

      // 送信完了画面
      "sent_success_title": "送信完了",
      "sent_success_description": "{{email}} 宛に再設定の手順を送信しました。メールボックスをご確認ください。",

      // 規約・同意
      "i_agree_to": "同意します：",
      "terms_of_service": "利用規約",
      "and": "および",
      "privacy_policy": "プライバシーポリシー",

      // バリデーション・エラーメッセージ
      "error_email_required": "メールアドレスを入力してください",
      "error_password_required": "パスワードを入力してください",
      "error_name_required": "名前を入力してください",
      "error_something_went_wrong": "エラーが発生しました。もう一度お試しください",

      // AI分析関連のエラー
      "AI_ANALYSIS_ERROR": "AI分析の実行中にエラーが発生しました。時間をおいて再度お試しください。",
      "ANALYSIS_FAILED": "分析に失敗しました",
      "UNEXPECTED_ERROR": "予期せぬエラーが発生しました",
      "PROMPT_REQUIRED": "分析用のデータが不足しています",

      // 内省フォーム (ReflectionForm) 用
      "reflection_title": "振り返り",
      "reflection_subtitle": "自己評価と気づき",
      "focus_quality": "集中の質",
      "evaluation_worst": "最悪",
      "evaluation_poor": "微妙",
      "evaluation_neutral": "普通",
      "evaluation_good": "良い",
      "evaluation_amazing": "最高",
      "status_label": "ステータス",
      "interruption_reason_label": "中断理由",
      "session_completed": "セッション完了",
      "reason_notifications": "通知",
      "reason_phone_call": "電話",
      "reason_involuntary": "無意識に触った",
      "reason_external_noise": "周囲の騒音",
      "reason_fatigue": "疲れ・飽き",
      "reason_other": "その他",
      "insights_label": "気づき (任意)",
      "insights_placeholder": "今の気持ちや、次に活かしたいことを記入してください...",
      "save_analyze": "保存して分析",
      "analyzing_session": "分析中...",
      "interrupted": "中断"
    }
  },
  en: {
    translation: {
      // Nav Labels
      "nav_timer": "Timer",
      "nav_analysis": "Analysis",
      "nav_history": "History",
      "nav_settings": "Settings",
      "nav_logout": "Logout",

      // Landing Page
      "lp_hero_subtitle": "Flip your phone to switch on focus,<br />and build your routine for deep concentration.",
      "get_started": "Get Started",
      "log_in": "Log In",
      "lp_slide_1": {
        "title": "1. Set Timer",
        "description": "Set your target time to focus. Start with a manageable range."
      },
      "lp_slide_2": {
        "title": "2. Flip Your Phone",
        "description": "The moment you put it down, tracking begins. Block notifications and enter your own time."
      },
      "lp_slide_3": {
        "title": "3. AI Analysis",
        "description": "Visualize your focus depth with advanced sensor analysis. AI evaluates your quality."
      },
      "lp_slide_4": {
        "title": "4. Make it a Routine",
        "description": "Record daily focus and build an optimal work rhythm. Get your ideal habits."
      },

      // Header / Title
      "back": "Back",
      "create_account": "Create Account",
      "welcome_back": "Welcome Back",
      "reset_password_title": "Reset Password",
      "reset_password_description": "Enter your email address. We will send you instructions to reset your password.",

      // Timer / Focus (Main screens)
      "select_mode": "Select Mode",
      "timer_mode": "Timer Mode",
      "timer_mode_sub": "Set Target Time",
      "focus_mode": "Focus Mode",
      "focus_mode_sub": "Unlimited Tracking",
      "start_session": "Start Session",
      "hrs": "Hrs",
      "min": "Min",
      "status_focusing_msg": "Focusing...",
      "status_complete_msg": "Target Completed! Please pick up your device.",

      // PC Link (PcLinkPage)
      "pc_link_guide_badge": "PC Link Guide",
      "pc_link_title": "Sync with PC",
      "pc_link_step1_title": "Open URL on PC",
      "pc_link_step1_desc": "Visit FocusFlow on your computer browser and log in.",
      "pc_link_step2_title": "Allow Notifications",
      "pc_link_step2_desc": "Click 'Allow' when the browser asks for notification permission.",
      "pc_link_step3_title": "Flip Your Phone",
      "pc_link_step3_desc": "Once ready, flip your phone. PC screen will sync automatically.",
      "pc_link_benefit": "Seamless experience for distraction-free work on PC",
      "pc_link_copy_url": "Copy PC URL",
      "pc_link_footer_note": "* Must be logged in with the same account.\nEnsure browser notifications are enabled.",
      "pc_link_ready_sync": "Ready to Sync",
      "pc_link_waiting_link": "Waiting for Link",
      "pc_link_pc_main_title": "PC Integration",
      "pc_link_pc_main_desc": "Simply flip your phone to switch your PC to focus mode.",
      "pc_link_step_allow_title": "Notification Permission",
      "pc_link_step_allow_desc": "Please enable browser notifications.",
      "pc_link_step_flip_title": "Flip Device",
      "pc_link_step_flip_desc": "Ready. Flip your phone to start synchronization.",
      "pc_link_btn_allow": "Allow Notifications & Wait",
      "pc_link_ready_status": "Integration Ready",
      "pc_link_waiting_flip": "Waiting for device flip...",
      "pc_linked": "PC Linked ",
      "pc_unlinked": "PC Unlinked ",

      // Sensor Engine (FocusDetectionEngine)
      "engine_capabilities": {
        "arch_badge": "System Integrated Architecture",
        "hero_subtitle": "The science of concentration: 4 core technologies",
        "slide1_desc": "Maximize brain performance with optimal cycles based on the Pomodoro Technique.",
        "slide2_desc": "Flip your phone. That physical switch activates your focus mode.",
        "slide3_desc": "Providing a scientific approach to immerse yourself in single tasks by blocking notifications.",
        "slide4_desc": "PC and mobile device integration. Seamless experience that leaves no room for distraction.",
        "sensor_desc": "Uses the smartphone's gyro sensor to detect the device's flip state in real time.",
        "btn_init": "Start Engine",
        "status_focused": "Focusing",
        "status_standby": "Standby",
        "algo_active": "Detection Algorithm Active"
      },

      "warning_title": "Return Device!",
      "warning_subtitle": "Penalty in {{count}}s...",
      "engine_status_active": "Monitoring",
      "instruction_flip_to_start": "Flip Device",

      // History Page
      "history_title": "History",
      "loading_logs": "Loading focus logs...",
      "no_sessions": "No Sessions Recorded",

      // Analysis / Detail
      "focus_report_header": "FOCUS REPORT",
      "detail_mode_label": "MEASUREMENT MODE",
      "detail_timer_label": "TIMER",
      "detail_focus_label": "FOCUS",
      "focus_stability": "Focus Stability Trend",
      "score": "Score",
      "user_reflection": "User Reflection",
      "no_motion_data": "No motion data available",
      "generating_chart": "Generating chart...",
      "no_analysis_data": "Waiting for data or session too short to analyze.",
      "no_reflection": "No reflection notes recorded.",
      "ai_analysis": "AI Analysis Report",

      // Analysis Page
      "analysis_title": "Analysis Report",
      "coming_soon_graph": "Focus Flow Graph (Coming Soon)",
      "ai_advisor_label": "AI Advisor",
      "score_label": "Score",
      "focus_time_label": "Focus Time",
      "analysis_loading": "AI is analyzing focus data...",
      "analysis_server_error": "Server error. Please try again later.",
      "analysis_waiting": "Waiting for results...",

      // Logs
      "logs": {
        "focus_level": "Focus Level",
        "focus_trend": "Focus Trend",
        "no_data": "No log data available"
      },

      // Labels
      "user_name": "Username",
      "email": "Email Address",
      "email_address": "Email Address",
      "password": "Password",
      "confirm_password": "Confirm Password",

      // Placeholders
      "placeholder_user": "Enter username",
      "placeholder_email": "Enter email address",

      // Buttons / Links
      "sign_up": "Sign Up",
      "sign_in": "Sign In",
      "forgot_password": "Forgot Password?",
      "dont_have_account": "Don't have an account?",
      "send_instructions": "Send Instructions",
      "back_to_login": "Back to Login",
      "sending": "Sending...",

      // Success
      "sent_success_title": "Sent Successfully",
      "sent_success_description": "Instructions sent to {{email}}. Please check your inbox.",

      // Legal
      "i_agree_to": "I agree to:",
      "terms_of_service": "Terms of Service",
      "and": "and",
      "privacy_policy": "Privacy Policy",

      // Validation
      "error_email_required": "Email is required",
      "error_password_required": "Password is required",
      "error_name_required": "Name is required",
      "error_something_went_wrong": "An error occurred. Please try again.",

      // AI Errors
      "AI_ANALYSIS_ERROR": "Error during AI analysis. Please try again later.",
      "ANALYSIS_FAILED": "Analysis failed",
      "UNEXPECTED_ERROR": "An unexpected error occurred",
      "PROMPT_REQUIRED": "Insufficient data for analysis",

      // ReflectionForm
      "reflection_title": "REFLECTION",
      "reflection_subtitle": "Self-Evaluation & Insights",
      "focus_quality": "Focus Quality",
      "evaluation_worst": "Worst",
      "evaluation_poor": "Poor",
      "evaluation_neutral": "Neutral",
      "evaluation_good": "Good",
      "evaluation_amazing": "Amazing",
      "status_label": "Status",
      "interruption_reason_label": "Interruption Reason",
      "session_completed": "Session Completed",
      "reason_notifications": "Notifications",
      "reason_phone_call": "Phone Call",
      "reason_involuntary": "Involuntary",
      "reason_external_noise": "External Noise",
      "reason_fatigue": "Fatigue",
      "reason_other": "Other",
      "insights_label": "Insights (Optional)",
      "insights_placeholder": "Write your thoughts or future goals...",
      "save_analyze": "Save & Analyze",
      "analyzing_session": "Analyzing...",
      "interrupted": "Interrupted"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;