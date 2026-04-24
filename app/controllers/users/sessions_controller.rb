class Users::SessionsController < Devise::SessionsController
  # React(API)からのリクエストに対応するためJSONを許可
  respond_to :json

  # ログイン成功時の処理（リダイレクトを阻止してJSONを返す）
  def create
    # Wardenによる認証実行
    self.resource = warden.authenticate!(auth_options)
    sign_in(resource_name, resource)
    
    yield resource if block_given?

    # 成功時のレスポンス
    render json: {
      status: { code: 200, message: 'Logged in successfully.' },
      data: {
        id: resource.id,
        email: resource.email
      }
    }, status: :ok
  end

  # ログアウト成功時の処理（リダイレクトを阻止）
  def respond_to_on_destroy
    render json: {
      status: 200,
      message: "Logged out successfully"
    }, status: :ok
  end

  private

  # APIリクエストの場合、CSRFトークンの検証をスキップまたは柔軟にする設定
  # (必要に応じて ApplicationController で一括設定しても良い)
end