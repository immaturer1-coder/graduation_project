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