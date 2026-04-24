// Entry point for the build script in your package.json
import "@hotwired/turbo-rails"
import "./controllers"

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './src/components/App';

// i18n の設定ファイルをインポート
import './src/i18n';

document.addEventListener('turbo:load', () => {
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    // resources 内に翻訳データを直書きしているため、Suspense なしで即時レンダリング可能
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
});