Rails.application.routes.draw do
  # ルートパスをLPに設定
  root 'static_pages#landing'
  
  devise_for :users
  
end