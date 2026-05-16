import { useState, useCallback, useEffect } from 'react';

/**
 * PCデバイス（ブラウザ）のネイティブ通知を制御するカスタムフック。
 * PC判定（1024px以上）かつブラウザが通知に対応している場合のみ動作。
 */
export const useNotification = () => {
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  // PC環境判定
  const isPcDevice = useCallback(() => {
    return window.innerWidth >= 1024;
  }, []);

  /**
   * 通知の許可をリクエストする
   */
  const requestPermission = useCallback(async () => {
    if (!isPcDevice() || !('Notification' in window)) return 'denied';

    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, [isPcDevice]);

  /**
   * 通知を送信する
   * @param {string} title - 通知タイトル
   * @param {object} options - body, icon, tag などのNotificationオプション
   */
  const sendNotification = useCallback((title, options = {}) => {
    // 動作条件: PCであること、通知に対応していること、許可されていること
    if (!isPcDevice() || !('Notification' in window) || Notification.permission !== 'granted') {
      return null;
    }

    const defaultOptions = {
      icon: '/apple-touch-icon.png', // 必要に応じて適切なアイコンパスに変更
      silent: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // クリック時にウィンドウにフォーカスを当てるなどの共通処理
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (error) {
      console.error('Notification error:', error);
      return null;
    }
  }, [isPcDevice]);

  // マウント時にパーミッションを最新の状態にする
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    requestPermission,
    sendNotification,
    isSupported: typeof window !== 'undefined' && 'Notification' in window,
    isPc: isPcDevice()
  };
};

export default useNotification;