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