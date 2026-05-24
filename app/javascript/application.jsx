// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/components/App';

// i18n の設定ファイルをインポート
import './src/i18n';

// グローバル変数でRootを保持し、二重初期化を防ぐ
window.reactRoot = window.reactRoot || null;

const renderApp = () => {
  const container = document.getElementById('root');
  
  // Guardを外して、常にマウントする（React側で画面の出し分けを管理）
  if (container) {
    if (!window.reactRoot) {
      window.reactRoot = createRoot(container);
    }
    
    window.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

// 初回ロード時およびTurbo遷移時の両方に対応
document.addEventListener('turbo:load', renderApp);

// ページ遷移の直前にクリーンアップ
document.addEventListener('turbo:before-cache', () => {
  if (window.reactRoot) {
    window.reactRoot.unmount();
    window.reactRoot = null;
  }
});