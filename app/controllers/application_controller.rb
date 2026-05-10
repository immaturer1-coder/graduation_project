class ApplicationController < ActionController::Base
  # 1. セキュリティ設定：正規のCSRF保護を有効化
  protect_from_forgery with: :exception

  # クッキー機能を有効にする
  include ActionController::Cookies

  # 2. フィルタ設定
  before_action :authenticate_user!
  before_action :configure_permitted_parameters, if: :devise_controller?
  
  after_action :set_csrf_cookie

  protected

  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [:name])
    devise_parameter_sanitizer.permit(:account_update, keys: [:name])
  end

  # APIエラーレスポンスの共通化
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
      path: '/',
      expires: 2.weeks.from_now,
      httponly: false,   # JavaScript(Axios)から読み取るため false
      secure: true,     # HTTPS環境のため常に true
      same_site: :none   # クロスサイト/クロスドメイン通信を許可
    }
    
    # 開発中のトラブルシューティング用（不要になれば削除可）
    if Rails.env.development?
      Rails.logger.debug "[CSRF] Token set to cookies (HTTPS mode) for: #{request.path}"
    end
  end
end