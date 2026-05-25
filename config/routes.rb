Rails.application.routes.draw do
  # 1. 開発用
  if Rails.env.development?
    mount LetterOpenerWeb::Engine, at: "/letter_opener"
  end


  # 2. Deviseの設定
  devise_for :users, controllers: {
    sessions: 'users/sessions',
    registrations: 'users/registrations',
    passwords: 'users/passwords'
  }

  # 3. ルートパス設定
  root 'static_pages#landing'

  # 4. APIエンドポイント
  namespace :api do
    resources :focus_records, only: [:create, :index, :show]
    post 'ai_analysis/analyze', to: 'ai_analysis#analyze'
    
    # パスワード更新API
    patch '/users/password', to: 'passwords#update'
    
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
    !req.path.include?('.') &&
    !req.path.start_with?('/users/password')
  }
end