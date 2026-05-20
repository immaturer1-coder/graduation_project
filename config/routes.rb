Rails.application.routes.draw do
  # 1. 開発用
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end

  get '/users/sign_in', to: 'static_pages#landing'
  get '/users/sign_up', to: 'static_pages#landing'

  # 2. Deviseの設定（API通信用として残す）
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations'
  }

  # 3. ルートパス設定
  root 'static_pages#landing'

  # 4. APIエンドポイント
  namespace :api do
    resources :focus_records, only: [:create, :index, :show]
    post 'ai_analysis/analyze', to: 'ai_analysis#analyze'
    
    namespace :v1 do
      resources :translations, only: [:index], defaults: { format: :json }
    end
  end

  # 健康診断のドア
  get '/health/redis', to: 'redis_health_checks#show'


  # 5. React Router / SPA 対策 
  get '*path', to: 'static_pages#landing', constraints: ->(req) {
    !req.xhr? &&
    req.format.html? &&
    req.path.exclude?('/api') &&
    req.path.exclude?('/letter_opener') &&
    !req.path.start_with?('/rails/active_storage') &&
    !req.path.include?('.')
  }
end