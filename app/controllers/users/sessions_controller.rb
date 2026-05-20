class Users::SessionsController < Devise::SessionsController
  # React(API)からのリクエストに対応するためJSONを許可
  respond_to :json

  # API経由のログアウト時にCSRF検証で弾かれるのを防ぐため検証をスキップ
  skip_before_action :verify_authenticity_token, only: [:destroy]

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

  # ログアウト成功時の処理
  def destroy
    # 1. ActionCableの接続をRedis経由で強制解除するためのフラグ削除
    if current_user
      Rails.cache.delete("user_#{current_user.id}_connected")
      # さらに、既存の接続に対する配信停止を想定し、必要であればストリームをクリーンにする
      # 接続状態を完全にクリアするため、ユーザーIDに基づく特定のキャッシュや関連情報を一掃
      Rails.cache.delete("user_#{current_user.id}_last_seen")
    end

    # 2. Deviseのサインアウト処理
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))
    
    # 3. ブラウザ側のセッションをサーバーから完全に破棄
    reset_session
    
    # 4. ブラウザが古いステートを持ち越さないよう、
    # フロントエンドでの即時リダイレクトを要求
    render json: {
      status: 200,
      message: "Logged out successfully",
      action: "force_reload",
      cleared: true
    }, status: :ok
  end

  def respond_to_on_destroy
    render json: {
      status: 200,
      message: "Logged out successfully"
    }, status: :ok
  end

  private
end