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
      "sent_success_description": "{email} 宛に再設定の手順を送信しました。メールボックスをご確認ください。",

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
      "PROMPT_REQUIRED": "分析用のデータが不足しています"
    }
  },
  en: {
    translation: {
      "back": "Back",
      "create_account": "CREATE ACCOUNT",
      "welcome_back": "WELCOME BACK",
      "reset_password_title": "RESET PASSWORD",
      "reset_password_description": "Please enter your registered email address. We will send you instructions to reset your password.",
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
      "sent_success_description": "We've sent reset instructions to {email}. Please check your inbox.",
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
      "PROMPT_REQUIRED": "Prompt data is required"
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
      escapeValue: false // Reactは標準でエスケープ処理を行うため不要
    }
  });

export default i18n;