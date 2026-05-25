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
  const path = window.location.pathname;
  
  const shouldRenderReact = container && (
    path === '/' || 
    path === '/users/password/edit' || 
    !path.startsWith('/users/password')
  );

  if (shouldRenderReact) {
    // レンダリング前に中身を一度クリアして、Railsの混入HTMLを消去する
    if (path === '/users/password/edit') {
      container.innerHTML = '';
    }

    if (!window.reactRoot) {
      window.reactRoot = createRoot(container);
    }
    
    window.reactRoot.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    // レンダリングしない場合はアンマウントする
    if (window.reactRoot) {
      window.reactRoot.unmount();
      window.reactRoot = null;
    }
  }
};

// 初回ロード時およびTurbo遷移時の両方に対応
document.addEventListener('turbo:load', renderApp);

// ページ遷移の直前にクリーンアップ（二重レンダリングやメモリリークを防止）
document.addEventListener('turbo:before-cache', () => {
  if (window.reactRoot) {
    window.reactRoot.unmount();
    window.reactRoot = null;
  }
});