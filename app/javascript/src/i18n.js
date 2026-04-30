import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * 画面上のすべてのテキストの翻訳リソース
 */
const resources = {
  ja: {
    translation: {
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
      "focus_mode": "フォーカスモード",
      "focus_mode_sub": "無制限に計測",
      "start_session": "計測開始",
      "hrs": "時",
      "min": "分",
      "status_focusing_msg": "集中計測中...",
      "status_complete_msg": "目標達成！端末を戻してください",

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
      "analyzing_session": "分析中..."
    }
  },
  en: {
    translation: {
      "back": "Back",
      "create_account": "CREATE ACCOUNT",
      "welcome_back": "WELCOME BACK",
      "reset_password_title": "RESET PASSWORD",
      "reset_password_description": "Please enter your registered email address. We will send you instructions to reset your password.",
      
      "select_mode": "Select Mode",
      "timer_mode": "Timer Mode",
      "timer_mode_sub": "SET TARGET TIME",
      "focus_mode": "Focus Mode",
      "focus_mode_sub": "UNLIMITED TRACKING",
      "start_session": "START SESSION",
      "hrs": "Hrs",
      "min": "Min",
      "status_focusing_msg": "Focusing...",
      "status_complete_msg": "Target Completed! Pick up",

      "user_name": "USER NAME",
      "email": "EMAIL ADDRESS",
      "email_address": "EMAIL ADDRESS",
      "password": "PASSWORD",
      "confirm_password": "CONFIRM PASSWORD",
      "placeholder_user": "Focus User",
      "placeholder_email": "your@email.com",
      "sign_up": "Sign Up",
      "sign_in": "Sign In",
      "forgot_password": "FORGOT PASSWORD?",
      "dont_have_account": "Don't have an account?",
      "send_instructions": "Send Instructions",
      "back_to_login": "Back to Log In",
      "sending": "Sending...",
      "sent_success_title": "SENT SUCCESSFULLY",
      "sent_success_description": "We've sent reset instructions to {{email}}. Please check your inbox.",
      "i_agree_to": "I agree to the",
      "terms_of_service": "Terms of Service",
      "and": "and",
      "privacy_policy": "Privacy Policy",
      "error_email_required": "Please enter your email",
      "error_password_required": "Please enter your password",
      "error_name_required": "Please enter your name",
      "error_something_went_wrong": "Something went wrong. Please try again",

      // AI Analysis related errors
      "AI_ANALYSIS_ERROR": "An error occurred during AI analysis. Please try again later.",
      "ANALYSIS_FAILED": "Analysis failed",
      "UNEXPECTED_ERROR": "An unexpected error occurred",
      "PROMPT_REQUIRED": "Prompt data is required",

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
      "session_completed": "SESSION COMPLETED",
      "reason_notifications": "Notifications",
      "reason_phone_call": "Phone Call",
      "reason_involuntary": "Involuntary",
      "reason_external_noise": "External Noise",
      "reason_fatigue": "Fatigue",
      "reason_other": "Other",
      "insights_label": "Insights (Optional)",
      "insights_placeholder": "Write your thoughts here...",
      "save_analyze": "Save & Analyze",
      "analyzing_session": "ANALYZING SESSION..."
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