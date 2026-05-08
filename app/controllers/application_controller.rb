class ApplicationController < ActionController::Base
  # 1. セキュリティ設定
  # :null_session から :exception に変更し、より強固な保護にします
  protect_from_forgery with: :exception

  # クッキー機能を有効にする（API通信でトークンを渡すために必要）
  include ActionController::Cookies

  # 2. フィルタ設定
  # 全体に対してログイン認証を必須にする
  before_action :authenticate_user!

  # Deviseのパラメータ許可（既存の処理）
  before_action :configure_permitted_parameters, if: :devise_controller?
  
  # すべてのレスポンスの後にCSRFトークンをクッキーにセット
  after_action :set_csrf_cookie

  protected

  # 既存のDevise用設定を維持
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  # 既存のエラーハンドリング用メソッドを維持
  def render_error(message, status = :internal_server_error)
    render json: { 
      status: 'error', 
      message: message 
    }, status: status
  end

  private

  # 3. CSRFトークンをクッキーにセットする処理
  def set_csrf_cookie
    cookies['CSRF-TOKEN'] = {
      value: form_authenticity_token,
      domain: :all,
      secure: Rails.env.production?
    }
  end
end