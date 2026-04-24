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