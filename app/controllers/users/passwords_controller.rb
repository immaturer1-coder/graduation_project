# app/controllers/users/passwords_controller.rb
class Users::PasswordsController < Devise::PasswordsController
  skip_before_action :authenticate_user!
  respond_to :json, :html # HTMLとJSONの両方を許可

  def edit
    self.resource = resource_class.new
    set_minimum_password_length
    resource.reset_password_token = params[:reset_password_token]
    render html: "".html_safe, layout: 'application'
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
    # デバッグ用に送信されたトークンをログに出力
    Rails.logger.info "DEBUG: Received token: #{resource_params[:reset_password_token]}"

    self.resource = resource_class.reset_password_by_token(resource_params)
    yield resource if block_given?

    if resource.errors.empty?
      resource.unlock_access! if unlockable?(resource)

      # 次の画面遷移（LP画面）で表示させるためにRailsのflashを設定する
      flash[:notice] = "パスワードが正常に更新されました。"

      respond_to do |format|
        format.json do
          render json: {
            message: "パスワードが正常に更新されました。",
            redirect_path: root_path
          }, status: :ok
        end
        format.html { redirect_to root_path }
      end
    else
      # エラーの詳細をログに出力
      Rails.logger.error "DEBUG: Password update failed. Errors: #{resource.errors.full_messages}"

      # 修正点: エラー時も同様にformat.jsonを先頭に移動。
      respond_to do |format|
        format.json do
          # エラーメッセージを明示的に翻訳キーから取得して返す
          error_messages = resource.errors.map do |error|
            if error.attribute == :reset_password_token
              I18n.t('errors.messages.invalid_token', default: '無効なトークン、または期限切れです。もう一度メール送信からやり直してください。')
            else
              error.full_message
            end
          end
          render json: { errors: error_messages }, status: :unprocessable_entity
        end
        format.html { respond_with resource }
      end
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