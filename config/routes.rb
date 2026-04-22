Rails.application.routes.draw do
  # ルートパスをLPに設定
  root 'static_pages#landing'
  
  devise_for :users

  # --- API エンドポイント ---
  namespace :api do
    # セッション（集中データ）の保存用
    resources :sessions, only: [:create]
  end

  # --- React Router / SPA 対策 ---
  # API 以外のリクエストで HTML を求めている場合は、
  # 全て static_pages#landing (Reactの親) に流す設定
  # これにより、ブラウザでリロードしても 404 にならない
  get '*path', to: 'static_pages#landing', constraints: ->(req) {
    !req.xhr? && req.format.html?
  }
end