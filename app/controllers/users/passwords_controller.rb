class Users::PasswordsController < Devise::PasswordsController
  skip_before_action :authenticate_user!
  respond_to :json, :html # HTMLとJSONの両方を許可

  def edit
    super
  end

  def create
    self.resource = resource_class.send_reset_password_instructions(resource_params)
    yield resource if block_given?

    if successfully_sent?(resource)
      render json: { message: "再設定用メールを送信しました。" }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)
      render json: { message: "パスワードが正常に更新されました。" }, status: :ok
    else
      render json: { errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end

  protected

  # パスワード再設定メール送信後の遷移先
  def after_sending_reset_password_instructions_path_for(resource_name)
    root_path
  end

  # パスワード更新後の遷移先
  def after_resetting_password_path_for(resource)
    root_path
  end
end