# プロジェクトソースコード集
生成日時: 2026-04-27 11:15:40

> 対象パス: `{app,config}/**/*`

---
### 📂 ファイル: `app/assets/config/manifest.js`
```javascript
//= link_tree ../images
//= link_tree ../builds
```

---
### 📂 ファイル: `app/assets/stylesheets/application.tailwind.css`
```css
@import "tailwindcss";
```

---
### 📂 ファイル: `app/channels/application_cable/channel.rb`
```ruby
module ApplicationCable
  class Channel < ActionCable::Channel::Base
  end
end
```

---
### 📂 ファイル: `app/channels/application_cable/connection.rb`
```ruby
module ApplicationCable
  class Connection < ActionCable::Connection::Base
  end
end
```

---
### 📂 ファイル: `app/controllers/api/ai_analysis_controller.rb`
```ruby
class Api::AiAnalysisController < ApplicationController
  # 疎通テストのため認証をスキップ。テスト完了後に必ず元に戻すこと。
  # before_action :authenticate_user!

  def analyze
    prompt = params[:prompt]
    system_instruction = params[:system_instruction]

    # キーの読み込みチェック
    if ENV['GEMINI_API_KEY'].blank?
      Rails.logger.error "[AI_ANALYSIS] GEMINI_API_KEY is missing in Rails environment"
      return render json: { error: 'API_KEY_MISSING' }, status: :internal_server_error
    end

    if prompt.blank?
      return render json: { error: 'PROMPT_REQUIRED' }, status: :bad_request
    end

    begin
      service = GeminiService.new
      response_text = service.generate_content(prompt, system_instruction)
      
      render json: { 
        success: true, 
        analysis: response_text 
      }
    rescue => e
      # ログにエラーのクラス、メッセージ、バックトレースを出力
      Rails.logger.error "[AI_ANALYSIS] Exception: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      render json: { 
        success: false, 
        error: 'AI_ANALYSIS_ERROR',
        debug_message: e.message # 開発時のみ詳細を返す設定（任意）
      }, status: :internal_server_error
    end
  end
end
```

---
### 📂 ファイル: `app/controllers/api/focus_records_controller.rb`
```ruby
class Api::FocusRecordsController < ApplicationController
  # Deviseの認証を適用
  before_action :authenticate_user!
  
  # JSON形式のリクエストに対してCSRFスキップ（API用途）
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  def create
    # FocusRecord と FocusRecordDetail を同時に作成する
    # accepts_nested_attributes_for をモデルに定義しているため、一括保存が可能
    @focus_record = current_user.focus_records.build(focus_record_params)

    if @focus_record.save
      render json: { 
        status: 'success', 
        message: 'Focus session saved successfully',
        id: @focus_record.id 
      }, status: :created
    else
      render json: { 
        status: 'error', 
        errors: @focus_record.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  private

  def focus_record_params
    # ER図に基づいたパラメータ許可
    # focus_record_detail_attributes を通じて、詳細データ（motion_logs）も受け取る
    params.require(:focus_record).permit(
      :mode, 
      :started_at, 
      :ended_at, 
      :duration_minutes, 
      :focus_level, 
      :stop_reason, 
      :note,
      focus_record_detail_attributes: [:is_finished, :motion_logs]
    )
  end
end
```

---
### 📂 ファイル: `app/controllers/api/v1/translations_controller.rb`
```ruby
module Api
  module V1
    class TranslationsController < ApplicationController
      # 翻訳データは認証前に必要なため、認証をスキップ
      skip_before_action :authenticate_user!

      def index
        # フロントエンドで必要な言語リスト
        languages = [:ja, :en]
        
        resources = languages.each_with_object({}) do |locale, hash|
          # I18n.backend.send(:init_translations) unless I18n.backend.initialized?
          # 全翻訳データをロードし、ネストされたハッシュとして取得
          hash[locale] = {
            translation: I18n.backend.send(:translations)[locale]
          }
        end

        render json: resources
      end
    end
  end
end
```

---
### 📂 ファイル: `app/controllers/application_controller.rb`
```ruby
class ApplicationController < ActionController::Base
  # JSONリクエストの場合はCSRFチェックを柔軟にする
  protect_from_forgery with: :null_session, if: -> { request.format.json? }

  # Deviseのパラメータ許可
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  # JSONリクエストのエラー時に、HTMLページではなくJSONを返すための共通処理
  def render_error(message, status = :internal_server_error)
    render json: { 
      status: 'error', 
      message: message 
    }, status: status
  end
end
```

---
### 📂 ファイル: `app/controllers/static_pages_controller.rb`
```ruby
class StaticPagesController < ApplicationController
  def landing
  end
end
```

---
### 📂 ファイル: `app/controllers/users/registrations_controller.rb`
```ruby
class Users::RegistrationsController < Devise::RegistrationsController
  # JSONリクエストの場合、CSRFチェックをスキップ
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  # API（React）からのリクエストに対応するためJSON形式を許可
  respond_to :json

  # 新規登録アクションをオーバーライド
  def create
    build_resource(sign_up_params)

    resource.save
    if resource.persisted?
      if resource.active_for_authentication?
        sign_in(resource_name, resource)
        render json: {
          status: 'success',
          message: 'Signed up successfully.',
          data: {
            id: resource.id,
            email: resource.email,
            name: resource.name
          }
        }, status: :ok
      else
        expire_data_after_sign_in!
        render json: {
          status: 'success',
          message: "Signed up successfully but #{resource.inactive_message}",
          data: {
            id: resource.id,
            email: resource.email,
            name: resource.name
          }
        }, status: :ok
      end
    else
      clean_up_passwords resource
      set_minimum_password_length
      # バリデーションエラー（422）
      render json: {
        status: 'error',
        message: "User could not be created successfully.",
        errors: resource.errors.full_messages
      }, status: :unprocessable_entity
    end
  rescue => e
    # 500エラーの内容をJSONでフロントに返す
    logger.error "=== REGISTRATION FATAL ERROR ==="
    logger.error e.message
    logger.error e.backtrace.join("\n")
    render json: { 
      status: 'error', 
      message: "Internal Server Error: #{e.message}",
      debug_info: "Ensure 'name' is not null in DB"
    }, status: :internal_server_error
  end

  protected

  def sign_up_params
    params.require(:user).permit(:name, :email, :password, :password_confirmation)
  end
end
```

---
### 📂 ファイル: `app/controllers/users/sessions_controller.rb`
```ruby
class Users::SessionsController < Devise::SessionsController
  # React(API)からのリクエストに対応するためJSONを許可
  respond_to :json

  # ログイン成功時の処理（リダイレクトを阻止してJSONを返す）
  def create
    # Wardenによる認証実行
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    
    yield resource if block_given?

    # 成功時のレスポンス
    render json: {
      status: { code: 200, message: 'Logged in successfully.' },
      data: {
        id: resource.id,
        email: resource.email
      }
    }, status: :ok
  end

  # ログアウト成功時の処理（リダイレクトを阻止）
  def respond_to_on_destroy
    render json: {
      status: 200,
      message: "Logged out successfully"
    }, status: :ok
  end

  private

  # APIリクエストの場合、CSRFトークンの検証をスキップまたは柔軟にする設定
  # (必要に応じて ApplicationController で一括設定しても良い)
end
```

---
### 📂 ファイル: `app/helpers/application_helper.rb`
```ruby
module ApplicationHelper
end
```

---
### 📂 ファイル: `app/helpers/static_pages_helper.rb`
```ruby
module StaticPagesHelper
end
```

---
### 📂 ファイル: `app/javascript/application.jsx`
```javascript
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
```

---
### 📂 ファイル: `app/javascript/controllers/application.js`
```javascript
import { Application } from "@hotwired/stimulus"

const application = Application.start()

// Configure Stimulus development experience
application.debug = false
window.Stimulus   = application

export { application }
```

---
### 📂 ファイル: `app/javascript/controllers/hello_controller.js`
```javascript
import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.element.textContent = "Hello World!"
  }
}
```

---
### 📂 ファイル: `app/javascript/controllers/index.js`
```javascript
// This file is auto-generated by ./bin/rails stimulus:manifest:update
// Run that command whenever you add a new controller or create them with
// ./bin/rails generate stimulus controllerName

import { application } from "./application"

import HelloController from "./hello_controller"
application.register("hello", HelloController)
```

---
### 📂 ファイル: `app/javascript/src/api/auth.js`
```javascript
/**
 * Authentication API Client
 * This version strictly avoids .join() and delegates all complex error formatting
 * to the UI layer's safety functions to prevent runtime crashes.
 */

const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * Login process
 */
export const login = async (email, password) => {
  const response = await fetch('/users/sign_in.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify({
      user: { email, password }
    })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error('Connection error: Server returned unexpected content.');
  }

  const data = await response.json();
  
  if (!response.ok) {
    // We do NOT use .join() here.
    throw { message: data.error || 'Invalid email or password.' };
  }
  
  return data;
};

/**
 * Sign up process
 * Absolutely no .join() calls allowed in this function.
 */
export const signUp = async (username, email, password, passwordConfirmation) => {
  const response = await fetch('/users.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify({
      user: {
        name: username, 
        email: email,
        password: password,
        password_confirmation: passwordConfirmation
      }
    })
  });

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    throw new Error('Server configuration error. Please contact support.');
  }

  const data = await response.json();

  if (!response.ok) {
    // 修正ポイント: ここで配列操作(join)をせず、errorsオブジェクトをそのまま投げる。
    // UI側の safeToString がこれを安全に解析して表示する。
    throw { 
      message: data.errors || data.message || 'Registration failed' 
    };
  }

  return data;
};
```

---
### 📂 ファイル: `app/javascript/src/api/focus_records.js`
```javascript
/**
 * FocusRecord 関連のリクエストを担当するユーティリティ
 */

const getCsrfToken = () => {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute('content') : '';
};

/**
 * 集中記録を保存する
 * @param {Object} result - タイマーから渡されるセッション結果
 */
export const createFocusRecord = async (result) => {
  // Rails側の accepts_nested_attributes_for :focus_record_detail に合わせた構造
  const payload = {
    focus_record: {
      mode: result.mode,
      duration_minutes: Math.floor(result.duration / 60), // 秒を分に変換
      stop_reason: result.interrupted ? 'interrupted' : 'completed',
      // 1対1のリレーション先（FocusRecordDetail）のデータ
      focus_record_detail_attributes: {
        is_finished: result.completed,
        motion_logs: result.logs
      }
    }
  };

  const response = await fetch('/api/focus_records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-CSRF-Token': getCsrfToken()
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.errors?.join(', ') || 'Failed to save record');
  }

  return await response.json();
};
```

---
### 📂 ファイル: `app/javascript/src/components/App.jsx`
```javascript
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, History, Settings, LogOut, ChevronRight, Activity, Timer } from 'lucide-react';

// API & UI Components
// 修正箇所: sessions から focus_records へのインポート変更
import { createFocusRecord } from '../api/focus_records';
import LoadingOverlay from './ui/LoadingOverlay';

// 各ファイルへの正しい相対パス
import LandingPage from '../pages/auth/LandingPage';
import SignUpPage from '../pages/auth/SignUpPage';
import LoginPage from '../pages/auth/LoginPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import TermsPage from '../pages/static/TermsPage';
import PrivacyPage from '../pages/static/PrivacyPage';
import AnalysisPage from '../pages/main/AnalysisPage';
import HistoryPage from '../pages/main/HistoryPage';
import FocusDetectionPage from '../pages/main/FocusDetectionPage';
import ConcentrationTimer from '../pages/main/ConcentrationTimer';

/**
 * 認証後の共通レイアウト
 */
const AuthenticatedLayout = ({ children, currentPage, setCurrentPage, onLogout }) => (
  <div className="fixed inset-0 bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
    <main className="flex-1 p-5 max-w-md mx-auto w-full overflow-hidden relative">{children}</main>
    <nav className="bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 px-8 py-4 flex justify-between items-center">
      <button onClick={() => setCurrentPage('timer')} className={`p-2 ${currentPage === 'timer' ? 'text-indigo-400' : 'text-slate-600'}`}><Timer size={24} /></button>
      <button onClick={() => setCurrentPage('analysis')} className={`p-2 ${currentPage === 'analysis' ? 'text-indigo-400' : 'text-slate-600'}`}><LayoutDashboard size={24} /></button>
      <button onClick={() => setCurrentPage('history')} className={`p-2 ${currentPage === 'history' ? 'text-indigo-400' : 'text-slate-600'}`}><History size={24} /></button>
      <button onClick={() => setCurrentPage('settings')} className={`p-2 ${['settings', 'terms', 'privacy', 'focus-test'].includes(currentPage) ? 'text-indigo-400' : 'text-slate-600'}`}><Settings size={24} /></button>
      <button onClick={onLogout} className="p-2 text-slate-600 hover:text-rose-400"><LogOut size={24} /></button>
    </nav>
  </div>
);

/**
 * 設定画面
 */
const SettingsPage = ({ onNavigate }) => (
  <div className="animate-in fade-in duration-500">
    <h2 className="text-xl font-black italic uppercase tracking-tighter mb-6 text-indigo-400">Settings</h2>
    <div className="space-y-3">
      <button
        onClick={() => onNavigate('focus-test')}
        className="w-full text-left p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-indigo-500/20 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Activity size={18} className="text-indigo-400" />
          <span>Focus Detection Test (Beta)</span>
        </div>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </button>

      <button
        onClick={() => onNavigate('terms')}
        className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
      >
        <span>Terms of Service</span>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </button>
      <button
        onClick={() => onNavigate('privacy')}
        className="w-full text-left p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm font-bold flex justify-between items-center group active:bg-slate-800 transition-colors"
      >
        <span>Privacy Policy</span>
        <ChevronRight size={18} className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
      </button>
    </div>
  </div>
);

export default function App() {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [history, setHistory] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // アラーム音用のRef
  const audioRef = useRef(null);

  const navigate = (page) => {
    setHistory(prev => [...prev, currentPage]);
    setCurrentPage(page);
  };

  const goBack = () => {
    if (history.length > 0) {
      const lastPage = history[history.length - 1];
      setHistory(prev => prev.slice(0, -1));
      setCurrentPage(lastPage);
    }
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setCurrentPage('timer');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage('landing');
    setHistory([]);
  };

  /**
   * 設定時間が過ぎた際のアラーム通知
   */
  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.warn("Audio play failed (waiting for user interaction):", e);
      });
    }
  };

  /**
   * 物理アクションによる終了（スマホを表に向ける）
   * 修正箇所: createFocusRecord を呼び出すように変更
   */
  const handleFocusComplete = async (result) => {
    // 1. 音を止める
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    setIsSaving(true);
    
    try {
      // 修正箇所: 以前の createSession(result) を createFocusRecord(result) に変更
      await createFocusRecord(result);
      console.log("Focus record saved successfully.");
      
      // 2. 分析画面へ遷移
      setCurrentPage('analysis');
    } catch (error) {
      console.error("Failed to save focus record:", error);
      // エラー時もユーザー体験を阻害しないよう、分析画面へ遷移させる
      setCurrentPage('analysis');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={navigate} />;
      case 'signup':  return <SignUpPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'login':   return <LoginPage onNavigate={navigate} onAuthSuccess={handleAuthSuccess} />;
      case 'reset':   return <ResetPasswordPage onNavigate={navigate} />;
      case 'terms':   return <TermsPage onNavigate={goBack} />;
      case 'privacy': return <PrivacyPage onNavigate={goBack} />;
      default:        return <LandingPage onNavigate={navigate} />;
    }
  }

  return (
    <AuthenticatedLayout currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout}>
      {/* 保存中のオーバーレイ表示 */}
      {isSaving && <LoadingOverlay message="Analyzing Session..." />}

      {/* アラーム音源（ループ再生） */}
      <audio
        ref={audioRef}
        src="https://actions.google.com/sounds/v1/alarms/alarm_clock_ringing_proximity.ogg"
        loop
      />

      {currentPage === 'timer' && (
        <ConcentrationTimer
          onComplete={handleFocusComplete}
          onTimeUp={playAlarm}
        />
      )}

      {currentPage === 'analysis' && <AnalysisPage />}
      {currentPage === 'history' && <HistoryPage />}
      {currentPage === 'settings' && <SettingsPage onNavigate={navigate} />}

      {currentPage === 'focus-test' && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          <FocusDetectionPage onNavigate={goBack} />
        </div>
      )}

      {(currentPage === 'terms' || currentPage === 'privacy') && (
        <div className="absolute inset-0 z-50 bg-slate-950">
          {currentPage === 'terms' ? <TermsPage onNavigate={goBack} /> : <PrivacyPage onNavigate={goBack} />}
        </div>
      )}
    </AuthenticatedLayout>
  );
}
```

---
### 📂 ファイル: `app/javascript/src/components/ui/Card.jsx`
```javascript
import React from 'react';

/**
 * Path: app/javascript/src/components/ui/Card.jsx
 * コンテンツセクション用の汎用カードコンポーネント
 */
const Card = ({ children, className = "", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 transition-all 
        ${onClick ? 'hover:bg-slate-800/80 cursor-pointer active:scale-[0.98]' : ''} 
        ${className}
      `}
    >
      {children}
    </div>
  );
};

export default Card;
```

---
### 📂 ファイル: `app/javascript/src/components/ui/InputField.jsx`
```javascript
import React from 'react';

/**
 * Path: app/javascript/src/components/ui/InputField.jsx
 * アイコンとラベル付きの標準入力フィールド
 */
const InputField = ({ label, type, placeholder, icon: Icon, value, onChange }) => {
  return (
    <div className="mb-3">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Icon size={16} />
        </div>
        <input
          type={type}
          value={value}
          onChange={onChange}
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-sm rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo-500 transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default InputField;
```

---
### 📂 ファイル: `app/javascript/src/components/ui/LoadingOverlay.jsx`
```javascript
import React from 'react';

const LoadingOverlay = ({ message = "PROCESSING..." }) => (
  <div className="fixed inset-0 bg-slate-950/90 z-[100] flex flex-col items-center justify-center animate-in fade-in duration-300">
    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_20px_rgba(99,102,241,0.3)]"></div>
    <p className="text-indigo-400 font-black italic animate-pulse tracking-widest text-sm uppercase">
      {message}
    </p>
  </div>
);

export default LoadingOverlay;
```

---
### 📂 ファイル: `app/javascript/src/components/ui/PrimaryButton.jsx`
```javascript
import React from 'react';

/**
 * Path: app/javascript/src/components/ui/PrimaryButton.jsx
 * FocusFlow専用のプライマリアクションボタン
 */
const PrimaryButton = ({ children, onClick, icon: Icon, disabled = false, className = "" }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-lg
        ${disabled
          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/20 active:scale-95'
        }
        ${className}
      `}
    >
      {children}
      {Icon && <Icon size={18} />}
    </button>
  );
};

export default PrimaryButton;
```

---
### 📂 ファイル: `app/javascript/src/hooks/useGemini.js`
```javascript
import { useState, useCallback } from 'react';

/**
 * Railsバックエンドを経由してGemini APIを利用するためのカスタムフック
 */
export const useGemini = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async (prompt, systemInstruction = '') => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/ai_analysis/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]')?.content
        },
        body: JSON.stringify({
          prompt,
          system_instruction: systemInstruction
        })
      });

      const data = await response.json();

      if (!response.ok) {
        // API側からエラーキーが返ればそれを使用し、なければデフォルトを投げる
        throw new Error(data.error || 'ANALYSIS_FAILED');
      }

      return data.analysis;
    } catch (err) {
      // ネットワークエラー等の予期せぬエラー
      const message = err.message || 'UNEXPECTED_ERROR';
      setError(message);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  return {
    analyze,
    isAnalyzing,
    error,
    clearError: () => setError(null)
  };
};
```

---
### 📂 ファイル: `app/javascript/src/hooks/useSensorLogger.js`
```javascript
import { useState, useEffect, useRef } from 'react';

/**
 * センサーログ収集専用のカスタムフック
 * @param {boolean} isActive - 集中フェーズかつスマホが裏向きかどうか
 */
export const useSensorLogger = (isActive) => {
  const [logs, setLogs] = useState([]);
  const logsRef = useRef([]); // 最新のログを保持するRef
  const lastRecordedAngle = useRef(null);
  const lastRecordTimestamp = useRef(0);

  const ANGLE_THRESHOLD = 5; 
  const HEARTBEAT_INTERVAL = 30000;

  // logsが更新されるたびにRefを更新
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    if (!isActive) return;

    const handleOrientation = (event) => {
      const currentAngle = Math.round(event.beta || 0);
      const now = Date.now();

      const hasSignificantChange =
        lastRecordedAngle.current === null ||
        Math.abs(currentAngle - lastRecordedAngle.current) > ANGLE_THRESHOLD;

      const isHeartbeatTime = (now - lastRecordTimestamp.current) > HEARTBEAT_INTERVAL;

      if (hasSignificantChange || isHeartbeatTime) {
        const newLog = {
          t: new Date().toISOString(),
          angle: currentAngle
        };

        setLogs(prev => [...prev, newLog]);
        lastRecordedAngle.current = currentAngle;
        lastRecordTimestamp.current = now;
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);
    return () => window.removeEventListener('deviceorientation', handleOrientation, true);
  }, [isActive]);

  return { 
    logs, 
    getLatestLogs: () => logsRef.current,
    resetLogs: () => {
      setLogs([]);
      logsRef.current = [];
    }
  };
};
```

---
### 📂 ファイル: `app/javascript/src/i18n.js`
```javascript
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
```

---
### 📂 ファイル: `app/javascript/src/pages/auth/LandingPage.jsx`
```javascript
import React from 'react';
import { UserPlus, LogIn } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';

/**
 * アプリのランディングページ
 */
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 bg-slate-950">
      <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent mb-4 italic leading-tight">
        FocusFlow
      </h1>
      <p className="text-slate-400 text-sm max-w-xs mb-10 leading-relaxed">
        スマートフォンの「裏返し」をスイッチに、<br />深い集中状態へのルーティンを。
      </p>
      <div className="w-full max-w-xs space-y-4">
        <PrimaryButton onClick={() => onNavigate('signup')} icon={UserPlus}>
          Get Started
        </PrimaryButton>
        <button
          onClick={() => onNavigate('login')}
          className="w-full bg-transparent border border-slate-800 text-slate-300 font-bold py-3 rounded-xl hover:bg-slate-900 flex items-center justify-center gap-2 text-sm transition-all"
        >
          Log In <LogIn size={18} />
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/auth/LoginPage.jsx`
```javascript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';
import { login } from '../../api/auth';

/**
 * ログインページ
 */
const LoginPage = ({ onNavigate, onAuthSuccess }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();

    // 1. フロントエンドでの未入力チェック（日本語化対応）
    if (!email) {
      setError(t('error_email_required'));
      return;
    }
    if (!password) {
      setError(t('error_password_required'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      console.log('Login Success:', data);
      onAuthSuccess(data.data);
    } catch (err) {
      // 2. サーバーエラーのハンドリング
      // サーバーから "Invalid email or password." 等が返ってきた場合、
      // 共通の日本語メッセージに変換するか、i18nキーを使用します。
      if (err.message.includes('Invalid') || err.message.includes('password')) {
        setError(t('error_something_went_wrong')); // または専用の "ID/PWが違います" キーを作成
      } else {
        setError(t('error_something_went_wrong'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <button
          onClick={() => onNavigate('landing')}
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-8 text-xs transition-colors"
        >
          <ArrowLeft size={14} /> {t('back')}
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent italic tracking-tighter">
            FocusFlow
          </h1>
          <p className="text-slate-500 text-[10px] tracking-[0.3em] uppercase mt-1 font-bold">
            {t('welcome_back')}
          </p>
        </div>

        {/* onSubmitでハンドルすることで、スマホの「確定/Go」ボタンにも対応。
          InputFieldのrequired属性によるブラウザ標準の英語バリデーションを防ぐため、
          手動チェックを行う場合は form に noValidate をつけるか、requiredを外してJSで制御します。
        */}
        <form onSubmit={handleLogin} noValidate className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <InputField
            label={t('email')}
            type="email"
            placeholder={t('placeholder_email')}
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          // requiredを削除するか、ブラウザ標準に任せるか選択可能
          />
          <InputField
            label={t('password')}
            type="password"
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold text-center animate-in fade-in zoom-in duration-200">
              {error}
            </div>
          )}

          <div className="text-right mb-6">
            <button
              type="button"
              onClick={() => onNavigate('reset')}
              className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase font-bold tracking-widest transition-colors"
            >
              {t('forgot_password')}
            </button>
          </div>

          <PrimaryButton
            type="submit" // onClickではなくtype="submit"を推奨
            icon={loading ? Loader2 : ArrowRight}
            disabled={loading}
          >
            {loading ? t('signing_in') : t('sign_in')}
          </PrimaryButton>
        </form>

        <p className="text-center text-slate-500 text-xs mt-8">
          {t('dont_have_account')}{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-indigo-400 font-bold hover:underline transition-all"
          >
            {t('sign_up')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/auth/ResetPasswordPage.jsx`
```javascript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, ShieldCheck, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';

/**
 * パスワード再設定ページ
 */
const ResetPasswordPage = ({ onNavigate }) => {
  const { t } = useTranslation();
  
  // 状態管理
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState('');

  // 送信ハンドラー
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!email) {
      setError(t('error_email_required'));
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 擬似的なAPI通信のシミュレーション（2秒）
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      console.log('Reset request for:', email);
      setIsSent(true);
    } catch (err) {
      // エラー時も多言語化対応のキーを使用
      setError(t('error_something_went_wrong'));
    } finally {
      setIsLoading(false);
    }
  };

  // 送信完了画面
  if (isSent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950 animate-in fade-in duration-500">
        <div className="w-full max-w-sm text-center">
          <div className="mb-8">
            <div className="inline-flex p-4 rounded-full bg-emerald-500/10 text-emerald-400 mb-4 border border-emerald-500/20">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
              {t('sent_success_title')}
            </h2>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              {/* i18nextの補完機能があれば {email} を渡せますが、シンプルに表示 */}
              {t('sent_success_description').replace('{email}', email)}
            </p>
          </div>

          <PrimaryButton onClick={() => onNavigate('login')}>
            {t('back_to_login')}
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm text-center">
        {/* ヘッダー部分 */}
        <div className="mb-8">
          <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-4 border border-indigo-500/20">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
            {t('reset_password_title')}
          </h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            {t('reset_password_description')}
          </p>
        </div>

        {/* フォームカード */}
        <form 
          onSubmit={handleSubmit}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left"
        >
          <InputField 
            label={t('email_address')} 
            type="email" 
            placeholder={t('placeholder_email')} 
            icon={Mail}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
          />
          
          {error && (
            <p className="text-red-400 text-[10px] font-bold uppercase mt-2 ml-1">
              {error}
            </p>
          )}

          <div className="mt-6">
            <PrimaryButton 
              type="submit"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={18} className="animate-spin" />
                  {t('sending')}
                </div>
              ) : (
                t('send_instructions')
              )}
            </PrimaryButton>
          </div>
        </form>

        {/* 下部ナビゲーション */}
        <button 
          onClick={() => onNavigate('login')} 
          disabled={isLoading}
          className="mt-8 text-slate-500 hover:text-indigo-400 text-[11px] font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 w-full disabled:opacity-30"
        >
          <ArrowLeft size={14} /> {t('back_to_login')}
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/auth/SignUpPage.jsx`
```javascript
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowLeft, CheckCircle2, Circle, User, Loader2 } from 'lucide-react';
import PrimaryButton from '../../components/ui/PrimaryButton';
import InputField from '../../components/ui/InputField';
import { signUp } from '../../api/auth';

/**
 * Sign Up Page
 * 規約同意部分の語順を言語設定に合わせて調整しました。
 */
const SignUpPage = ({ onNavigate, onAuthSuccess }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 現在の言語が日本語かどうかを判定
  const isJapanese = i18n.language && i18n.language.startsWith('ja');

  /**
   * どんな形式のエラーが来ても、絶対にクラッシュさせず文字列を返す関数
   */
  const formatErrorMessage = (msg) => {
    if (!msg) return t('error_unknown', 'An unknown error occurred.');
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) {
      return msg.map(m => (typeof m === 'object' ? JSON.stringify(m) : String(m))).join(', ');
    }
    if (typeof msg === 'object') {
      try {
        return Object.entries(msg)
          .map(([field, content]) => {
            const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
            const detail = Array.isArray(content) ? content.join(', ') : String(content);
            return `${fieldName}: ${detail}`;
          })
          .join('\n');
      } catch (e) {
        return JSON.stringify(msg);
      }
    }
    return String(msg);
  };

  const handleSignUp = async (e) => {
    if (e) e.preventDefault();
    if (!agreed) {
      setError(t('error_agree_terms', 'You must agree to the Terms and Privacy Policy.'));
      return;
    }
    if (password !== passwordConfirmation) {
      setError(t('error_password_mismatch', 'Passwords do not match.'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await signUp(username, email, password, passwordConfirmation);
      onAuthSuccess(data.user || data.data);
    } catch (err) {
      setError(formatErrorMessage(err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-950">
      <div className="w-full max-w-sm">
        <button
          onClick={() => onNavigate('landing')}
          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-6 text-xs transition-colors"
        >
          <ArrowLeft size={14} /> {t('back')}
        </button>

        <div className="text-center mb-6 text-white uppercase italic font-black tracking-tighter text-2xl">
          {t('create_account')}
        </div>

        <form onSubmit={handleSignUp} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl">
          <InputField 
            label={t('user_name')} 
            type="text" 
            placeholder={t('placeholder_user')} 
            icon={User} 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <InputField 
            label={t('email')} 
            type="email" 
            placeholder={t('placeholder_email')} 
            icon={Mail} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <InputField 
            label={t('password')} 
            type="password" 
            placeholder="••••••••" 
            icon={Lock} 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <InputField 
            label={t('confirm_password')} 
            type="password" 
            placeholder="••••••••" 
            icon={Lock} 
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
          />

          {error && (
            <div className="mt-2 mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-[10px] font-bold text-center whitespace-pre-wrap leading-relaxed">
              {error}
            </div>
          )}

          <div
            className="mt-4 mb-6 flex items-start gap-3 cursor-pointer select-none"
            onClick={() => setAgreed(!agreed)}
          >
            <div className={`mt-0.5 flex-shrink-0 ${agreed ? 'text-indigo-400' : 'text-slate-600'}`}>
              {agreed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </div>
            <div className="text-[10px] text-slate-400 leading-normal">
              {/* 英語の時のみ文頭に "I agree to the" を置く */}
              {!isJapanese && <>{t('i_agree_to')}{' '}</>}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigate('terms'); }}
                className="text-indigo-400 font-bold underline"
              >
                {t('terms_of_service')}
              </button>

              {' '}{t('and')}{' '}

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onNavigate('privacy'); }}
                className="text-indigo-400 font-bold underline"
              >
                {t('privacy_policy')}
              </button>

              {/* 日本語の時のみ文末に "に同意します" を置く */}
              {isJapanese ? <>{t('i_agree_to')}</> : '.'}
            </div>
          </div>

          <PrimaryButton 
            onClick={handleSignUp} 
            disabled={!agreed || loading}
            icon={loading ? Loader2 : null}
          >
            {loading ? (t('creating_account', 'Creating Account...')) : t('sign_up')}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/main/AnalysisPage.jsx`
```javascript
import React from 'react';
import { BarChart2, MessageSquare, Zap, Clock } from 'lucide-react';

/**
 * 分析詳細画面
 */

// モックデータ
const MOCK_ANALYSIS = {
  score: 85,
  focusTime: "120 min",
  aiMessage: "中盤の40分間は深いフロー状態でした。休憩を少し長めに取るとさらに効率が上がります。",
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const AnalysisPage = () => {
  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <header className="flex-shrink-0 pt-2">
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">Analysis</h2>
      </header>

      {/* 曲線グラフ・プレースホルダー */}
      <Card className="flex-1 min-h-[160px] flex flex-col items-center justify-center text-center space-y-2 border-dashed border-indigo-500/30 bg-indigo-500/5">
        <div className="relative w-full h-full flex items-center justify-center">
          <BarChart2 size={32} className="text-indigo-400 opacity-30 absolute" />
          <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-[0.2em] z-10">
            Focus Flow Graph (Coming Soon)
          </p>
        </div>
      </Card>

      {/* AIフィードバック */}
      <Card className="flex-shrink-0 bg-indigo-500/10 border-indigo-500/20 shadow-lg shadow-indigo-500/5">
        <div className="flex items-start gap-3">
          <MessageSquare size={18} className="text-indigo-400 mt-1 flex-shrink-0" />
          <div>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">AI Advisor</p>
            <p className="text-xs text-slate-300 leading-snug">
              {MOCK_ANALYSIS.aiMessage}
            </p>
          </div>
        </div>
      </Card>

      {/* 統計カード */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-3 pb-2">
        <Card className="flex items-center gap-3 py-3 hover:border-amber-500/30 transition-colors">
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400"><Zap size={18} /></div>
          <div>
            <p className="text-[8px] text-slate-500 font-bold uppercase">Score</p>
            <p className="text-xl font-black text-white italic leading-none">{MOCK_ANALYSIS.score}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 py-3 hover:border-blue-500/30 transition-colors">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Clock size={18} /></div>
          <div>
            <p className="text-[8px] text-slate-500 font-bold uppercase">Focus Time</p>
            <p className="text-xl font-black text-white italic leading-none">{MOCK_ANALYSIS.focusTime}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalysisPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/main/ConcentrationTimer.jsx`
```javascript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Square, Zap, Smartphone, ChevronLeft, Timer, Volume2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useSensorLogger } from '../../hooks/useSensorLogger';

/**
 * FocusDetectionEngine(子): センサー検知と物理フィードバック
 * ConcentrationTimer(親): タイマーのロジック、3秒の猶予時間（isWarning）、フェーズ管理などを担当
 */
const FocusDetectionEngine = ({ onFlipChange, active, isWarning }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const prevRef = useRef(false);
  const audioRef = useRef(null);

  const fb = useCallback((type) => {
    try {
      if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = audioRef.current;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(type === 'down' ? 800 : 1200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(type === 'down' ? 100 : 400, ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.05);
      if ('vibrate' in navigator) navigator.vibrate(type === 'down' ? [60, 40, 60] : 50);
    } catch (e) {}
  }, []);

  const handleOri = useCallback((e) => {
    const flipped = Math.abs(e.beta || 0) > 160 && Math.abs(e.gamma || 0) < 20;
    if (flipped !== prevRef.current) {
      fb(flipped ? 'down' : 'up');
      onFlipChange(flipped);
      prevRef.current = flipped;
    }
    setIsFlipped(flipped);
  }, [fb, onFlipChange]);

  useEffect(() => {
    if (active) window.addEventListener('deviceorientation', handleOri, true);
    return () => window.removeEventListener('deviceorientation', handleOri, true);
  }, [active, handleOri]);

  return (
    <div className={`w-64 h-80 rounded-[3rem] border-2 flex flex-col items-center justify-center transition-all duration-700 ${
      isWarning ? 'bg-rose-900/20 border-rose-500 animate-pulse' :
      isFlipped ? 'bg-slate-900 border-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.15)]' : 'bg-slate-900/50 border-slate-800'
    }`}>
      <div className={`p-8 rounded-full transition-all duration-700 ${
        isWarning ? 'bg-rose-600 text-white scale-90' :
        isFlipped ? 'bg-indigo-600 text-white rotate-180 scale-110' : 'bg-slate-800 text-slate-600'
      }`}>
        {isWarning ? <AlertTriangle size={56} /> : isFlipped ? <Volume2 size={56} /> : <Smartphone size={56} />}
      </div>
      <p className={`mt-8 text-2xl font-black italic uppercase ${isWarning ? 'text-rose-500' : isFlipped ? 'text-white' : 'text-slate-500'}`}>
        {isWarning ? 'Return Device!' : isFlipped ? 'Monitoring' : 'Flip Device'}
      </p>
      {isWarning && <span className="text-[10px] font-bold text-rose-400 mt-2 animate-bounce">Penalty in 3s...</span>}
    </div>
  );
};

const ConcentrationTimer = ({ onComplete }) => {
  const [phase, setPhase] = useState('mode_select');
  const [selectedMode, setSelectedMode] = useState(null);
  const [time, setTime] = useState({ h: 0, m: 25, s: 0 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [isWarning, setIsWarning] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const warningTimerRef = useRef(null);
  const alarmRef = useRef(null);
  const audioRef = useRef(null);

  // センサーログ収集のフック (getLatestLogs を取得)
  const { getLatestLogs } = useSensorLogger(phase === 'focusing' && isFlipped);

  // アラーム制御
  const toggleAlarm = useCallback((start) => {
    if (!start) return (clearInterval(alarmRef.current), alarmRef.current = null);
    if (alarmRef.current) return;
    if (!audioRef.current) audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
    const play = () => {
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
      if ('vibrate' in navigator) navigator.vibrate([100, 50, 100]);
    };
    play(); alarmRef.current = setInterval(play, 1500);
  }, []);

  // 中断判定・終了ロジック
  const handleFlip = useCallback((flipped) => {
    setIsFlipped(flipped);
    if (flipped) {
      setIsWarning(false);
      clearTimeout(warningTimerRef.current);
      if (phase === 'waiting') setPhase('focusing');
    } else if (phase === 'focusing') {
      // ログの最新状態をRef経由で取得（依存関係を回避するため）
      const currentLogs = getLatestLogs();

      if (isTimeUp) {
        toggleAlarm(false);
        onComplete({ 
          duration: time.s, 
          mode: selectedMode, 
          completed: true,
          interrupted: false,
          logs: currentLogs 
        });
      } else {
        setIsWarning(true);
        warningTimerRef.current = setTimeout(() => {
          toggleAlarm(false);
          onComplete({ 
            duration: time.s, 
            mode: selectedMode, 
            completed: false, 
            interrupted: true,
            logs: currentLogs 
          });
        }, 3000);
      }
    }
    // 依存配列に logs を含めないことで、ログ蓄積による関数の再生成を防ぐ
  }, [phase, time.s, selectedMode, isTimeUp, onComplete, toggleAlarm, getLatestLogs]);

  // タイマー進行
  useEffect(() => {
    let timer;
    if (phase === 'focusing' && isFlipped) {
      const target = time.h * 3600 + time.m * 60;
      timer = setInterval(() => {
        setTime(p => {
          const nextS = p.s + 1;
          if (selectedMode === 'timer' && nextS >= target && !isTimeUp) {
            setIsTimeUp(true);
            toggleAlarm(true);
          }
          return { ...p, s: nextS };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [phase, isFlipped, selectedMode, time.h, time.m, isTimeUp, toggleAlarm]);

  const DrumRoll = ({ list, value, onChange, label }) => {
    const scrollRef = useRef(null);
    useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = value * 44; }, [value]);
    return (
      <div className="flex flex-col items-center">
        <span className="text-[9px] font-black text-slate-600 mb-1 uppercase tracking-widest">{label}</span>
        <div className="relative h-40 w-16 overflow-hidden">
          <div ref={scrollRef} className="h-full overflow-y-auto snap-y snap-mandatory no-scrollbar pt-14 pb-14" onScroll={e => {
            const idx = Math.round(e.target.scrollTop / 44);
            if (list[idx] !== undefined && list[idx] !== value) onChange(list[idx]);
          }}>
            {list.map(v => <div key={v} className={`h-[44px] flex items-center justify-center snap-center transition-all ${value === v ? 'text-3xl font-black text-white italic' : 'text-sm font-bold text-slate-700'}`}>{v.toString().padStart(2, '0')}</div>)}
          </div>
          <div className="absolute top-1/2 w-full h-11 border-y border-indigo-500/30 pointer-events-none -translate-y-1/2"></div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-slate-100 p-6">
      {phase === 'mode_select' && (
        <div className="w-full max-w-xs space-y-4 animate-in fade-in">
          <div className="text-center mb-6">
            <h2 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] italic">Routine</h2>
            <p className="text-white font-bold text-lg italic">Select Mode</p>
          </div>
          <button onClick={() => { setSelectedMode('timer'); setPhase('timer_setup'); }} className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl active:scale-95 transition-all">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Timer size={24} /></div>
            <div className="text-left"><p className="font-black italic">Timer Mode</p><p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Fixed Target</p></div>
          </button>
          <button onClick={() => { setSelectedMode('focus'); setPhase('waiting'); }} className="w-full flex items-center gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl active:scale-95 transition-all">
            <div className="p-3 bg-cyan-500/10 rounded-2xl text-cyan-400"><Zap size={24} /></div>
            <div className="text-left"><p className="font-black italic">Focus Mode</p><p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Endless</p></div>
          </button>
        </div>
      )}

      {phase === 'timer_setup' && (
        <div className="w-full max-w-xs space-y-8 animate-in slide-in-from-right duration-300">
          <button onClick={() => setPhase('mode_select')} className="flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-widest"><ChevronLeft size={14} /> Back</button>
          <div className="flex flex-col items-center gap-6">
            <div className="flex justify-center gap-4">
              <DrumRoll list={[...Array(24).keys()]} value={time.h} onChange={v => setTime(p => ({ ...p, h: v }))} label="Hrs" />
              <div className="pt-6 text-2xl font-black text-indigo-500">:</div>
              <DrumRoll list={[...Array(60).keys()]} value={time.m} onChange={v => setTime(p => ({ ...p, m: v }))} label="Min" />
            </div>
            <div className="flex gap-4 w-full justify-center">
              {[15, 25, 50].map(m => (
                <button key={m} onClick={() => setTime({ h: Math.floor(m/60), m: m%60, s: 0 })} className={`px-5 py-2 rounded-xl text-[11px] font-black transition-all border ${(time.h * 60 + time.m) === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>{m}M</button>
              ))}
            </div>
          </div>
          <button onClick={() => setPhase('waiting')} className="w-full bg-white text-slate-950 py-4 rounded-2xl font-black text-lg active:scale-95 transition-all">START SESSION</button>
        </div>
      )}

      {(phase === 'waiting' || phase === 'focusing') && (
        <div className="flex flex-col items-center space-y-10 animate-in fade-in">
          <FocusDetectionEngine onFlipChange={handleFlip} active={true} isWarning={isWarning} />
          {phase === 'focusing' && (
            <div className="text-center space-y-3">
              <div className={`px-4 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2 ${isTimeUp ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 animate-pulse' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                {isTimeUp ? <CheckCircle2 size={12} /> : <Loader2 size={12} className="animate-spin" />}
                {isTimeUp ? 'Target Completed! Pick up' : 'Focusing...'}
              </div>
              <div className="text-7xl font-black text-white italic tracking-tighter tabular-nums">
                {Math.floor(time.s / 60).toString().padStart(2, '0')}:{(time.s % 60).toString().padStart(2, '0')}
              </div>
              {selectedMode === 'timer' && !isTimeUp && (
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                  Goal: {time.h.toString().padStart(2,'0')}:{time.m.toString().padStart(2,'0')}
                </p>
              )}
            </div>
          )}
          {phase === 'waiting' && <button onClick={() => setPhase('mode_select')} className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">Cancel</button>}
        </div>
      )}
    </div>
  );
};

export default ConcentrationTimer;
```

---
### 📂 ファイル: `app/javascript/src/pages/main/FocusDetectionPage.jsx`
```javascript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, ShieldCheck, ArrowLeft, Loader2, Volume2, SmartphoneNfc } from 'lucide-react';

/**
 * 集中モード検知エンジン (誤検知防止版)
 * 縦の回転(beta)だけでなく、左右の傾き(gamma)もチェックして「横に倒しただけ」での誤作動を防ぐ。
 */
const FocusDetectionPage = ({ onNavigate }) => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState(null);
  
  const prevFlippedRef = useRef(false);
  const audioCtxRef = useRef(null);

  const playFeedbackSound = useCallback((type) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      const startFreq = type === 'down' ? 800 : 1200;
      const endFreq = type === 'down' ? 100 : 400;

      osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {
      console.error("Audio feedback failed", e);
    }
  }, []);

  const triggerVibration = useCallback(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, []);

  const handleOrientation = useCallback((event) => {
    const beta = event.beta || 0;  // 前後の傾き
    const gamma = event.gamma || 0; // 左右の傾き

    /**
     * 【誤作動防止ロジック】
     * 1. Math.abs(beta) > 160 : 前後方向にほぼ裏返っている
     * 2. Math.abs(gamma) < 20 : 左右方向には大きく傾いていない（水平に近い）
     * この2つの条件が揃った時だけ「裏返し」と判定。
     */
    const flipped = Math.abs(beta) > 160 && Math.abs(gamma) < 20;

    if (flipped !== prevFlippedRef.current) {
      if (flipped) {
        playFeedbackSound('down');
        triggerVibration();
      } else {
        playFeedbackSound('up');
        triggerVibration();
      }
      prevFlippedRef.current = flipped;
    }

    setIsFlipped(flipped);
  }, [playFeedbackSound, triggerVibration]);

  const startMonitoring = useCallback(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
      setIsMonitoring(true);
    } else {
      setError('Sensor not supported');
    }
  }, [handleOrientation]);

  const stopMonitoring = useCallback(() => {
    window.removeEventListener('deviceorientation', handleOrientation, true);
    setIsMonitoring(false);
  }, [handleOrientation]);

  const initializeSensor = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
          startMonitoring();
        }
      } else {
        setPermissionGranted(true);
        startMonitoring();
      }
    } catch (err) {
      setError('Initialization failed');
    }
  };

  useEffect(() => {
    if (permissionGranted) startMonitoring();
    return () => stopMonitoring();
  }, [permissionGranted, startMonitoring, stopMonitoring]);

  return (
    <div className="h-[100dvh] w-full bg-[#0a0c14] text-slate-100 flex flex-col overflow-hidden font-sans select-none">
      <nav className="flex items-center px-6 pt-4 pb-2 shrink-0">
        <button onClick={() => onNavigate('analysis')} className="p-2 -ml-2 text-slate-400 active:bg-slate-800 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1 flex justify-center">
          <span className="text-[10px] font-black tracking-[0.3em] text-indigo-500 uppercase italic">
            Focus Detection
          </span>
        </div>
        <div className="w-10"></div>
      </nav>

      <main className="flex-1 flex flex-col px-6 justify-center">
        {!permissionGranted ? (
          <div className="text-center space-y-8">
            <div className="bg-indigo-500/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto rotate-12 border border-indigo-500/20">
              <SmartphoneNfc className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Test Focus Mode</h2>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed px-4">
                Enable sensors, sound, and haptics.<br />
                After granting permission, try flipping your phone face down.
              </p>
            </div>
            <button
              onClick={initializeSensor}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
            >
              Enable Features
            </button>
            {error && <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">{error}</p>}
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={`w-full aspect-[4/5] max-h-[400px] rounded-[3rem] border-2 transition-all duration-700 flex flex-col items-center justify-center relative overflow-hidden ${
              isFlipped 
                ? 'bg-slate-900 border-indigo-500 shadow-[0_0_80px_rgba(79,70,229,0.2)]' 
                : 'bg-slate-900/50 border-slate-800'
            }`}>
              <div className={`p-10 rounded-full transition-all duration-700 ${
                isFlipped ? 'bg-indigo-600 text-white rotate-180 scale-110' : 'bg-slate-800 text-slate-600'
              }`}>
                {isFlipped ? <Volume2 size={64} strokeWidth={1.5} /> : <Smartphone size={64} strokeWidth={1} />}
              </div>
              <div className="mt-10 text-center">
                <p className={`text-4xl font-black italic uppercase tracking-tighter transition-all duration-700 ${
                  isFlipped ? 'text-indigo-400' : 'text-slate-700'
                }`}>
                  {isFlipped ? 'Monitoring' : 'Ready'}
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <SmartphoneNfc size={14} className={isFlipped ? 'text-indigo-500' : 'text-slate-600'} />
                  <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${
                    isFlipped ? 'text-indigo-200' : 'text-slate-500'
                  }`}>
                    Stabilized Detection Active
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 rounded-full border border-white/5">
                <Loader2 className="w-3 h-3 text-indigo-500 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                  Precision Engine Running
                </span>
              </div>
              <p className="text-[9px] text-slate-700 font-medium text-center px-8 leading-relaxed">
                Responsive only when flipped vertically.<br/>
                Side tilts and unintentional rotations are filtered out.
              </p>
            </div>
          </div>
        )}
      </main>
      <div className="h-10 shrink-0"></div>
    </div>
  );
};

export default FocusDetectionPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/main/HistoryPage.jsx`
```javascript
import React from 'react';
import { Target } from 'lucide-react';

/**
 * ログ履歴画面
 */

// モックデータ
const RECENT_LOGS = [
  { id: 1, date: "03/20", duration: "50 min", score: 92 },
  { id: 2, date: "03/19", duration: "25 min", score: 65 },
  { id: 3, date: "03/18", duration: "120 min", score: 88 },
  { id: 4, date: "03/17", duration: "45 min", score: 72 },
];

const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-900/60 border border-slate-800/50 rounded-2xl p-4 ${className}`}>
    {children}
  </div>
);

const HistoryPage = () => {
  return (
    <div className="flex flex-col h-full space-y-4 animate-in fade-in duration-500">
      <header className="flex-shrink-0 pt-2">
        <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">History</h2>
      </header>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {RECENT_LOGS.map(log => (
          <Card key={log.id} className="flex items-center justify-between py-3 hover:bg-slate-800/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-800 rounded-xl text-slate-400">
                <Target size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{log.date} Session</p>
                <p className="text-[10px] text-slate-500">{log.duration}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-indigo-400 italic">{log.score}</p>
              <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">pts</p>
            </div>
          </Card>
        ))}

        {/* 下部の余白確保 */}
        <div className="h-4"></div>
      </div>
    </div>
  );
};

export default HistoryPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/static/PrivacyPage.jsx`
```javascript
import React from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PRIVACY_TEXT } from '../../utils/constants';

/**
 * プライバシーポリシー表示ページ
 */
const PrivacyPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 固定ヘッダー */}
      <header className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <button 
          onClick={() => onNavigate('signup')} 
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black tracking-widest uppercase italic">Privacy Policy</h1>
        <div className="w-10"></div>
      </header>

      {/* スクロール可能なコンテンツエリア */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6 text-cyan-500">
            <ShieldCheck size={48} strokeWidth={1.5} />
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-sans">
              {PRIVACY_TEXT}
            </pre>
          </div>

          <p className="text-center text-[10px] text-slate-500 mt-8 mb-4 uppercase tracking-[0.2em]">
            FocusFlow Data Protection
          </p>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPage;
```

---
### 📂 ファイル: `app/javascript/src/pages/static/TermsPage.jsx`
```javascript
import React from 'react';
import { ArrowLeft, FileText } from 'lucide-react';
import { TERMS_TEXT } from '../../utils/constants';

/**
 * 利用規約表示ページ
 */
const TermsPage = ({ onNavigate }) => {
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 font-sans">
      {/* 固定ヘッダー */}
      <header className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <button 
          onClick={() => onNavigate('signup')} 
          className="p-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-sm font-black tracking-widest uppercase italic">Terms of Service</h1>
        <div className="w-10"></div> {/* バランス調整用の空要素 */}
      </header>

      {/* スクロール可能なコンテンツエリア */}
      <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-center mb-6 text-indigo-500">
            <FileText size={48} strokeWidth={1.5} />
          </div>
          
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl">
            <pre className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300 font-sans">
              {TERMS_TEXT}
            </pre>
          </div>

          <p className="text-center text-[10px] text-slate-500 mt-8 mb-4 uppercase tracking-[0.2em]">
            FocusFlow Legal Information
          </p>
        </div>
      </main>
    </div>
  );
};

export default TermsPage;
```

---
### 📂 ファイル: `app/javascript/src/utils/constants.js`
```javascript
export const TERMS_TEXT = `利用規約

第1条（適用）
本規約は、FocusFlow（以下「本サービス」）の利用条件を定めるものです。

第2条（禁止事項）
ユーザーは、本サービスの利用にあたり、以下の行為をしてはなりません。
・法令または公序良俗に違反する行為
・本サービスの運営を妨害する行為
・他のユーザーに不利益を与える行為

第3条（サービスの提供停止）
当社は、予告なくサービスの内容を変更し、または提供を中止できるものとします。`;

export const PRIVACY_TEXT = `プライバシーポリシー

1. 個人情報の収集
本サービスでは、メールアドレス等の情報を収集します。

2. 利用目的
・ユーザー認証および本人確認のため
・サービスの改善および新機能の開発のため
・お問い合わせ対応のため

3. 第三者提供
法令に基づく場合を除き、同意なく第三者に個人情報を提供することはありません。`;
```

---
### 📂 ファイル: `app/jobs/application_job.rb`
```ruby
class ApplicationJob < ActiveJob::Base
  # Automatically retry jobs that encountered a deadlock
  # retry_on ActiveRecord::Deadlocked

  # Most jobs are safe to ignore if the underlying records are no longer available
  # discard_on ActiveJob::DeserializationError
end
```

---
### 📂 ファイル: `app/mailers/application_mailer.rb`
```ruby
class ApplicationMailer < ActionMailer::Base
  default from: "from@example.com"
  layout "mailer"
end
```

---
### 📂 ファイル: `app/models/application_record.rb`
```ruby
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end
```

---
### 📂 ファイル: `app/models/focus_record.rb`
```ruby
class FocusRecord < ApplicationRecord
  belongs_to :user
  
  has_one :focus_record_detail, dependent: :destroy

  validates :mode, presence: true
  validates :duration_minutes, presence: true
end
```

---
### 📂 ファイル: `app/models/focus_record_detail.rb`
```ruby
class FocusRecordDetail < ApplicationRecord
  # FocusRecordに属する (1対1)
  belongs_to :focus_record

  # motion_logsカラム(jsonb型)のデフォルト値を保証
  after_initialize :set_default_motion_logs, if: :new_record?

  private

  def set_default_motion_logs
    self.motion_logs ||= []
  end
end
```

---
### 📂 ファイル: `app/models/hint.rb`
```ruby
class Hint < ApplicationRecord
  # FocusRecordに属する
  belongs_to :focus_record
  
  # 統計データ(jsonb型)の初期化
  after_initialize :set_default_stats, if: :new_record?

  private

  def set_default_stats
    self.statistical_data ||= {}
  end
end
```

---
### 📂 ファイル: `app/models/user.rb`
```ruby
class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :focus_records, dependent: :destroy

  validates :name, presence: true
end
```

---
### 📂 ファイル: `app/services/gemini_service.rb`
```ruby
class GeminiService
  require 'net/http'
  require 'json'

  # 開発計画書: 「Gemini API連携基盤 (5SP)」に対応
  # 有料枠 (Tier 1) にて疎通確認済みの構成
  API_VERSION = "v1beta"
  
  # ログ診断により実在が確認された最新の Flash モデルを指定
  # 安定性を考慮し、エイリアス名 (gemini-flash-latest) を採用
  MODEL_NAME = "models/gemini-flash-latest"
  BASE_URL = "https://generativelanguage.googleapis.com/#{API_VERSION}/#{MODEL_NAME}:generateContent"

  def initialize(api_key = ENV['GEMINI_API_KEY'])
    @api_key = api_key
  end

  # PUBLIC: 汎用コンテンツ生成メソッド
  # AiAnalysisController#analyze からの直接呼び出しをサポート
  def generate_content(prompt, system_instruction = nil)
    # APIキーの存在チェック（基盤としてのガード）
    if @api_key.blank?
      raise "Gemini API Key is missing. Please check your .env file."
    end

    execute_api_call(prompt, system_instruction)
  end

  # PUBLIC: 集中セッション分析専用メソッド
  # 将来的に「内省データ」と「動作ログサマリー」を組み合わせて分析する基盤
  def analyze_session(motion_summary, reflection)
    prompt = "以下を分析してください:\n動作サマリー: #{motion_summary}\n内省内容: #{reflection}"
    system_instruction = "あなたは集中力解析の専門家です。ユーザーの動作と内省を比較し、客観的な分析を提供してください。"
    generate_content(prompt, system_instruction)
  end

  private

  # 実際のAPIリクエスト処理（共通ロジック）
  def execute_api_call(prompt, system_instruction)
    uri = URI("#{BASE_URL}?key=#{@api_key}")
    
    payload = {
      contents: [{ parts: [{ text: prompt }] }]
    }
    
    # システム指示（役割定義）が存在する場合のみペイロードに追加
    if system_instruction.present?
      payload[:systemInstruction] = { parts: [{ text: system_instruction }] }
    end

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 30 # タイムアウト設定を明示
    
    request = Net::HTTP::Post.new(uri.request_uri, { 'Content-Type' => 'application/json' })
    request.body = payload.to_json
    
    begin
      response = http.request(request)
      handle_response(response)
    rescue Net::ReadTimeout, Net::OpenTimeout => e
      raise "Gemini API Timeout: #{e.message}"
    rescue => e
      raise "Gemini API Connection Error: #{e.message}"
    end
  end

  # レスポンス判定とパース（共通処理）
  def handle_response(response)
    case response.code
    when "200"
      result = JSON.parse(response.body)
      # 候補が存在しない場合の例外処理
      text = result.dig('candidates', 0, 'content', 'parts', 0, 'text')
      text || raise("Gemini API Error: Content not found in response.")
    when "429"
      # クォータ（利用制限）エラーの明示
      raise "Gemini API Quota Exceeded (429): Too many requests."
    when "404"
      raise "Gemini API Model Not Found (404): Check MODEL_NAME or API_VERSION."
    else
      # その他のエラー（認証失敗、パラメータ不正など）
      raise "Gemini API Error #{response.code}: #{response.body}"
    end
  end
end
```

---
### 📂 ファイル: `config/application.rb`
```ruby
require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # デフォルトのロケールを日本語に設定
    config.i18n.default_locale = :ja
    
    # 複数のロケールファイルを読み込むための設定（オプション）
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}').to_s]

    # libディレクトリを読み込み対象に追加
    config.autoload_paths << Rails.root.join('lib')
  end
end
```

---
### 📂 ファイル: `config/boot.rb`
```ruby
ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup" # Set up gems listed in the Gemfile.
require "bootsnap/setup" # Speed up boot time by caching expensive operations.
```

---
### 📂 ファイル: `config/cable.yml`
```yaml
development:
  adapter: async

test:
  adapter: test

production:
  adapter: redis
  url: <%= ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } %>
  channel_prefix: app_production
```

---
### 📂 ファイル: `config/database.yml`
```yaml
# PostgreSQL. Versions 9.3 and up are supported.
#
default: &default
  adapter: postgresql
  encoding: unicode
  # docker-compose.ymlのサービス名「db」を指定
  host: db
  # postgresイメージのデフォルトユーザー
  username: postgres
  # docker-compose.ymlで指定したパスワード
  password: password
  # 接続プール数
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: graduation_project_development

test:
  <<: *default
  database: graduation_project_test

# 本番環境の設定（基本的にはこのまま、パスワード等は環境変数で管理）
production:
  <<: *default
  database: graduation_project_production
  username: graduation_project
  password: <%= ENV["GRADUATION_PROJECT_DATABASE_PASSWORD"] %>
```

---
### 📂 ファイル: `config/environment.rb`
```ruby
# Load the Rails application.
require_relative "application"

# Initialize the Rails application.
Rails.application.initialize!
```

---
### 📂 ファイル: `config/environments/development.rb`
```ruby
require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # In the development environment your application's code is reloaded any time
  # it changes. This slows down response time but is perfect for development
  # since you don't have to restart the web server when you make code changes.
  config.cache_classes = false

  # Do not eager load code on boot.
  config.eager_load = false

  # Show full error reports.
  config.consider_all_requests_local = true

  # Enable server timing
  config.server_timing = true

  # Enable/disable caching. By default caching is disabled.
  # Run rails dev:cache to toggle caching.
  if Rails.root.join("tmp/caching-dev.txt").exist?
    config.action_controller.perform_caching = true
    config.action_controller.enable_fragment_cache_logging = true

    config.cache_store = :memory_store
    config.public_file_server.headers = {
      "Cache-Control" => "public, max-age=#{2.days.to_i}"
    }
  else
    config.action_controller.perform_caching = false

    config.cache_store = :null_store
  end

  # メールURLのデフォルトホスト設定
  config.action_mailer.default_url_options = { host: 'localhost', port: 3000 }

  # --- 追記: Letter Opener Web の設定 ---
  # 開発環境で送信されたメールをブラウザで確認できるようにする
  config.action_mailer.delivery_method = :letter_opener_web
  # メールの送信に失敗した時にエラーを発生させる
  config.action_mailer.raise_delivery_errors = true
  # --------------------------------------

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  config.action_mailer.perform_caching = false

  # Print deprecation notices to the Rails logger.
  config.active_support.deprecation = :log

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raise an error on page load if there are pending migrations.
  config.active_record.migration_error = :page_load

  # Highlight code that triggered database queries in logs.
  config.active_record.verbose_query_logs = true

  # Suppress logger output for asset requests.
  config.assets.quiet = true

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true

  # Uncomment if you wish to allow Action Cable access from any origin.
  # config.action_cable.disable_request_forgery_protection = true

  # 全てのホスト名/IPでのアクセスを許可
  config.hosts.clear

  # HTTPSを強制
  config.force_ssl = true

  # 127.0.0.1 や Dockerネットワーク内のプロキシからのヘッダーを信頼する
  # Rails 7以降でNginx経由のHTTPSを正しく認識させるために必要
  config.assume_ssl = true
end
```

---
### 📂 ファイル: `config/environments/production.rb`
```ruby
require "active_support/core_ext/integer/time"

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Code is not reloaded between requests.
  config.cache_classes = true

  # Eager load code on boot. This eager loads most of Rails and
  # your application in memory, allowing both threaded web servers
  # and those relying on copy on write to perform better.
  # Rake tasks automatically ignore this option for performance.
  config.eager_load = true

  # Full error reports are disabled and caching is turned on.
  config.consider_all_requests_local       = false
  config.action_controller.perform_caching = true

  # Ensures that a master key has been made available in either ENV["RAILS_MASTER_KEY"]
  # or in config/master.key. This key is used to decrypt credentials (and other encrypted files).
  # config.require_master_key = true

  # Disable serving static files from the `/public` folder by default since
  # Apache or NGINX already handles this.
  config.public_file_server.enabled = ENV["RAILS_SERVE_STATIC_FILES"].present?

  # Compress CSS using a preprocessor.
  # config.assets.css_compressor = :sass

  # Do not fallback to assets pipeline if a precompiled asset is missed.
  config.assets.compile = false

  # Enable serving of images, stylesheets, and JavaScripts from an asset server.
  # config.asset_host = "http://assets.example.com"

  # Specifies the header that your server uses for sending files.
  # config.action_dispatch.x_sendfile_header = "X-Sendfile" # for Apache
  # config.action_dispatch.x_sendfile_header = "X-Accel-Redirect" # for NGINX

  # Store uploaded files on the local file system (see config/storage.yml for options).
  config.active_storage.service = :local

  # Mount Action Cable outside main process or domain.
  # config.action_cable.mount_path = nil
  # config.action_cable.url = "wss://example.com/cable"
  # config.action_cable.allowed_request_origins = [ "http://example.com", /http:\/\/example.*/ ]

  # Force all access to the app over SSL, use Strict-Transport-Security, and use secure cookies.
  # config.force_ssl = true

  # Include generic and useful information about system operation, but avoid logging too much
  # information to avoid inadvertent exposure of personally identifiable information (PII).
  config.log_level = :info

  # Prepend all log lines with the following tags.
  config.log_tags = [ :request_id ]

  # Use a different cache store in production.
  # config.cache_store = :mem_cache_store

  # Use a real queuing backend for Active Job (and separate queues per environment).
  # config.active_job.queue_adapter     = :resque
  # config.active_job.queue_name_prefix = "app_production"

  config.action_mailer.perform_caching = false

  # Ignore bad email addresses and do not raise email delivery errors.
  # Set this to true and configure the email server for immediate delivery to raise delivery errors.
  # config.action_mailer.raise_delivery_errors = false

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation cannot be found).
  config.i18n.fallbacks = true

  # Don't log any deprecations.
  config.active_support.report_deprecations = false

  # Use default logging formatter so that PID and timestamp are not suppressed.
  config.log_formatter = ::Logger::Formatter.new

  # Use a different logger for distributed setups.
  # require "syslog/logger"
  # config.logger = ActiveSupport::TaggedLogging.new(Syslog::Logger.new "app-name")

  if ENV["RAILS_LOG_TO_STDOUT"].present?
    logger           = ActiveSupport::Logger.new(STDOUT)
    logger.formatter = config.log_formatter
    config.logger    = ActiveSupport::TaggedLogging.new(logger)
  end

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false
end
```

---
### 📂 ファイル: `config/environments/test.rb`
```ruby
require "active_support/core_ext/integer/time"

# The test environment is used exclusively to run your application's
# test suite. You never need to work with it otherwise. Remember that
# your test database is "scratch space" for the test suite and is wiped
# and recreated between test runs. Don't rely on the data there!

Rails.application.configure do
  # Settings specified here will take precedence over those in config/application.rb.

  # Turn false under Spring and add config.action_view.cache_template_loading = true.
  config.cache_classes = true

  # Eager loading loads your whole application. When running a single test locally,
  # this probably isn't necessary. It's a good idea to do in a continuous integration
  # system, or in some way before deploying your code.
  config.eager_load = ENV["CI"].present?

  # Configure public file server for tests with Cache-Control for performance.
  config.public_file_server.enabled = true
  config.public_file_server.headers = {
    "Cache-Control" => "public, max-age=#{1.hour.to_i}"
  }

  # Show full error reports and disable caching.
  config.consider_all_requests_local       = true
  config.action_controller.perform_caching = false
  config.cache_store = :null_store

  # Raise exceptions instead of rendering exception templates.
  config.action_dispatch.show_exceptions = false

  # Disable request forgery protection in test environment.
  config.action_controller.allow_forgery_protection = false

  # Store uploaded files on the local file system in a temporary directory.
  config.active_storage.service = :test

  config.action_mailer.perform_caching = false

  # Tell Action Mailer not to deliver emails to the real world.
  # The :test delivery method accumulates sent emails in the
  # ActionMailer::Base.deliveries array.
  config.action_mailer.delivery_method = :test

  # Print deprecation notices to the stderr.
  config.active_support.deprecation = :stderr

  # Raise exceptions for disallowed deprecations.
  config.active_support.disallowed_deprecation = :raise

  # Tell Active Support which deprecation messages to disallow.
  config.active_support.disallowed_deprecation_warnings = []

  # Raises error for missing translations.
  # config.i18n.raise_on_missing_translations = true

  # Annotate rendered view with file names.
  # config.action_view.annotate_rendered_view_with_filenames = true
end
```

---
### 📂 ファイル: `config/initializers/assets.rb`
```ruby
# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = "1.0"

# Add additional assets to the asset load path.
# Rails.application.config.assets.paths << Emoji.images_path

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in the app/assets
# folder are already added.
# Rails.application.config.assets.precompile += %w( admin.js admin.css )
```

---
### 📂 ファイル: `config/initializers/content_security_policy.rb`
```ruby
# Be sure to restart your server when you modify this file.

# Define an application-wide content security policy.
# See the Securing Rails Applications Guide for more information:
# https://guides.rubyonrails.org/security.html#content-security-policy-header

# Rails.application.configure do
#   config.content_security_policy do |policy|
#     policy.default_src :self, :https
#     policy.font_src    :self, :https, :data
#     policy.img_src     :self, :https, :data
#     policy.object_src  :none
#     policy.script_src  :self, :https
#     policy.style_src   :self, :https
#     # Specify URI for violation reports
#     # policy.report_uri "/csp-violation-report-endpoint"
#   end
#
#   # Generate session nonces for permitted importmap and inline scripts
#   config.content_security_policy_nonce_generator = ->(request) { request.session.id.to_s }
#   config.content_security_policy_nonce_directives = %w(script-src)
#
#   # Report violations without enforcing the policy.
#   # config.content_security_policy_report_only = true
# end
```

---
### 📂 ファイル: `config/initializers/devise.rb`
```ruby
# frozen_string_literal: true

# Devise configuration file
Devise.setup do |config|
  # ==> Mailer Configuration
  config.mailer_sender = 'please-change-me-at-config-initializers-devise@example.com'

  # ==> ORM configuration
  require 'devise/orm/active_record'

  # ==> Configuration for any authentication mechanism
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth]

  # ==> Configuration for :database_authenticatable
  config.stretches = Rails.env.test? ? 1 : 12

  # ==> Configuration for :confirmable
  config.reconfirmable = true

  # ==> Configuration for :rememberable
  config.expire_all_remember_me_on_sign_out = true

  # ==> Configuration for :validatable
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  # ==> Configuration for :recoverable
  config.reset_password_within = 6.hours

  # ==> Navigation configuration
  config.navigational_formats = ['*/*', :html]

  # ==> Hotwire/Turbo configuration
  config.responder.error_status = :unprocessable_entity
  config.responder.redirect_status = :see_other

  config.paranoid = true

  # Custom failure app for JSON/API responses
  require_relative '../../lib/custom_failure'
  config.warden do |warden|
    warden.failure_app = CustomFailure
  end

  # The default HTTP method used to sign out a resource.
  config.sign_out_via = :delete
end
```

---
### 📂 ファイル: `config/initializers/inflections.rb`
```ruby
# Be sure to restart your server when you modify this file.

# Add new inflection rules using the following format. Inflections
# are locale specific, and you may define rules for as many different
# locales as you wish. All of these examples are active by default:
# ActiveSupport::Inflector.inflections(:en) do |inflect|
#   inflect.plural /^(ox)$/i, "\\1en"
#   inflect.singular /^(ox)en/i, "\\1"
#   inflect.irregular "person", "people"
#   inflect.uncountable %w( fish sheep )
# end

# These inflection rules are supported but not enabled by default:
# ActiveSupport::Inflector.inflections(:en) do |inflect|
#   inflect.acronym "RESTful"
# end
```

---
### 📂 ファイル: `config/initializers/permissions_policy.rb`
```ruby
# Define an application-wide HTTP permissions policy. For further
# information see https://developers.google.com/web/updates/2018/06/feature-policy
#
# Rails.application.config.permissions_policy do |f|
#   f.camera      :none
#   f.gyroscope   :none
#   f.microphone  :none
#   f.usb         :none
#   f.fullscreen  :self
#   f.payment     :self, "https://secure.example.com"
# end
```

---
### 📂 ファイル: `config/locales/devise.en.yml`
```yaml
# Additional translations at https://github.com/heartcombo/devise/wiki/I18n

en:
  devise:
    confirmations:
      confirmed: "Your email address has been successfully confirmed."
      send_instructions: "You will receive an email with instructions for how to confirm your email address in a few minutes."
      send_paranoid_instructions: "If your email address exists in our database, you will receive an email with instructions for how to confirm your email address in a few minutes."
    failure:
      already_authenticated: "You are already signed in."
      inactive: "Your account is not activated yet."
      invalid: "Invalid %{authentication_keys} or password."
      locked: "Your account is locked."
      last_attempt: "You have one more attempt before your account is locked."
      not_found_in_database: "Invalid %{authentication_keys} or password."
      timeout: "Your session expired. Please sign in again to continue."
      unauthenticated: "You need to sign in or sign up before continuing."
      unconfirmed: "You have to confirm your email address before continuing."
    mailer:
      confirmation_instructions:
        subject: "Confirmation instructions"
      reset_password_instructions:
        subject: "Reset password instructions"
      unlock_instructions:
        subject: "Unlock instructions"
      email_changed:
        subject: "Email Changed"
      password_change:
        subject: "Password Changed"
    omniauth_callbacks:
      failure: "Could not authenticate you from %{kind} because \"%{reason}\"."
      success: "Successfully authenticated from %{kind} account."
    passwords:
      no_token: "You can't access this page without coming from a password reset email. If you do come from a password reset email, please make sure you used the full URL provided."
      send_instructions: "You will receive an email with instructions on how to reset your password in a few minutes."
      send_paranoid_instructions: "If your email address exists in our database, you will receive a password recovery link at your email address in a few minutes."
      updated: "Your password has been changed successfully. You are now signed in."
      updated_not_active: "Your password has been changed successfully."
    registrations:
      destroyed: "Bye! Your account has been successfully cancelled. We hope to see you again soon."
      signed_up: "Welcome! You have signed up successfully."
      signed_up_but_inactive: "You have signed up successfully. However, we could not sign you in because your account is not yet activated."
      signed_up_but_locked: "You have signed up successfully. However, we could not sign you in because your account is locked."
      signed_up_but_unconfirmed: "A message with a confirmation link has been sent to your email address. Please follow the link to activate your account."
      update_needs_confirmation: "You updated your account successfully, but we need to verify your new email address. Please check your email and follow the confirmation link to confirm your new email address."
      updated: "Your account has been updated successfully."
      updated_but_not_signed_in: "Your account has been updated successfully, but since your password was changed, you need to sign in again."
    sessions:
      signed_in: "Signed in successfully."
      signed_out: "Signed out successfully."
      already_signed_out: "Signed out successfully."
    unlocks:
      send_instructions: "You will receive an email with instructions for how to unlock your account in a few minutes."
      send_paranoid_instructions: "If your account exists, you will receive an email with instructions for how to unlock it in a few minutes."
      unlocked: "Your account has been unlocked successfully. Please sign in to continue."
  errors:
    messages:
      already_confirmed: "was already confirmed, please try signing in"
      confirmation_period_expired: "needs to be confirmed within %{period}, please request a new one"
      expired: "has expired, please request a new one"
      not_found: "not found"
      not_locked: "was not locked"
      not_saved:
        one: "1 error prohibited this %{resource} from being saved:"
        other: "%{count} errors prohibited this %{resource} from being saved:"
```

---
### 📂 ファイル: `config/locales/en.yml`
```yaml
# Files in the config/locales directory are used for internationalization
# and are automatically loaded by Rails. If you want to use locales other
# than English, add the necessary files in this directory.
#
# To use the locales, use `I18n.t`:
#
#     I18n.t "hello"
#
# In views, this is aliased to just `t`:
#
#     <%= t("hello") %>
#
# To use a different locale, set it with `I18n.locale`:
#
#     I18n.locale = :es
#
# This would use the information in config/locales/es.yml.
#
# The following keys must be escaped otherwise they will not be retrieved by
# the default I18n backend:
#
# true, false, on, off, yes, no
#
# Instead, surround them with single quotes.
#
# en:
#   "true": "foo"
#
# To learn more, please read the Rails Internationalization guide
# available at https://guides.rubyonrails.org/i18n.html.

en:
  hello: "Hello world"
```

---
### 📂 ファイル: `config/locales/ja.yml`
```yaml
ja:
  # 共通のエラーメッセージ定義
  errors:
    format: "%{attribute}%{message}"
    messages:
      blank: "を入力してください"
      invalid: "は不正な値です"
      taken: "はすでに存在します"
      too_long: "は%{count}文字以内で入力してください"
      too_short: "は%{count}文字以上で入力してください"
      confirmation: "と%{attribute}が一致しません"
      not_found: "は見つかりませんでした"
      already_confirmed: "は既に確認済みです。ログインしてください。"
      confirmation_period_expired: "%{period}以内に確認する必要があります。新しくリクエストしてください。"
      expired: "の有効期限が切れています。新しくリクエストしてください。"
      not_saved:
        one: "エラーにより %{resource} を保存できませんでした。"
        other: "%{count} 個のエラーにより %{resource} を保存できませんでした。"

  # Devise固有のメッセージ（ログイン失敗時など）
  devise:
    failure:
      already_authenticated: "既にログインしています。"
      inactive: "アカウントが有効化されていません。"
      invalid: "メールアドレスまたはパスワードが正しくありません。"
      locked: "アカウントがロックされています。"
      last_attempt: "あと1回ログインに失敗するとアカウントがロックされます。"
      not_found_in_database: "メールアドレスまたはパスワードが正しくありません。"
      timeout: "セッションがタイムアウトしました。もう一度ログインしてください。"
      unauthenticated: "アカウント登録もしくはログインが必要です。"
      unconfirmed: "メールアドレスの確認が必要です。"
    sessions:
      signed_in: "ログインしました。"
      signed_out: "ログアウトしました。"
      already_signed_out: "既にログアウトしています。"
    registrations:
      signed_up: "アカウント登録が完了しました。"
      updated: "アカウント情報を変更しました。"
      destroyed: "アカウントを削除しました。"
    passwords:
      send_instructions: "パスワードの再設定方法をメールで送信しました。"
      updated: "パスワードが正しく変更されました。"

  # データベースの項目名とバリデーションエラーの翻訳
  activerecord:
    models:
      user: "ユーザー"
    attributes:
      user:
        name: "ユーザー名"
        email: "メールアドレス"
        password: "パスワード"
        password_confirmation: "パスワード（確認用）"
    errors:
      models:
        user:
          attributes:
            email:
              blank: "を入力してください"
            password:
              blank: "を入力してください"
            name:
              blank: "を入力してください"
```

---
### 📂 ファイル: `config/puma.rb`
```ruby
# Puma can serve each request in a thread from an internal thread pool.
# The `threads` method setting takes two numbers: a minimum and maximum.
# Any libraries that use thread pools should be configured to match
# the maximum value specified for Puma. Default is set to 5 threads for minimum
# and maximum; this matches the default thread size of Active Record.
#
max_threads_count = ENV.fetch("RAILS_MAX_THREADS") { 5 }
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

# Specifies the `worker_timeout` threshold that Puma will use to wait before
# terminating a worker in development environments.
#
worker_timeout 3600 if ENV.fetch("RAILS_ENV", "development") == "development"

# Specifies the `port` that Puma will listen on to receive requests; default is 3000.
#
port ENV.fetch("PORT") { 3000 }

# Specifies the `environment` that Puma will run in.
#
environment ENV.fetch("RAILS_ENV") { "development" }

# Specifies the `pidfile` that Puma will use.
pidfile ENV.fetch("PIDFILE") { "tmp/pids/server.pid" }

# Specifies the number of `workers` to boot in clustered mode.
# Workers are forked web server processes. If using threads and workers together
# the concurrency of the application would be max `threads` * `workers`.
# Workers do not work on JRuby or Windows (both of which do not support
# processes).
#
# workers ENV.fetch("WEB_CONCURRENCY") { 2 }

# Use the `preload_app!` method when specifying a `workers` number.
# This directive tells Puma to first boot the application and load code
# before forking the application. This takes advantage of Copy On Write
# process behavior so workers use less memory.
#
# preload_app!

# Allow puma to be restarted by `bin/rails restart` command.
plugin :tmp_restart
```

---
### 📂 ファイル: `config/routes.rb`
```ruby
Rails.application.routes.draw do
  # letter_opener_web のマウント
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  # Deviseの設定
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }, defaults: { format: :json }

  # ルートパス設定
  root 'static_pages#landing'

  namespace :api do
    resources :focus_records, only: [:create, :index, :show]

    # AI分析用のルートを追加
    post 'ai_analysis/analyze', to: 'ai_analysis#analyze'
    
    namespace :v1 do
      resources :translations, only: [:index], defaults: { format: :json }
    end
  end

  # React Router / SPA 対策 
  get '*path', to: 'static_pages#landing', constraints: ->(req) {
    !req.xhr? &&
    req.format.html? &&
    req.path.exclude?('/users') &&
    req.path.exclude?('/api') &&
    req.path.exclude?('/letter_opener') && # ここに除外設定を追加
    req.path.exclude?('/rails/active_storage')
  }
end
```

---
