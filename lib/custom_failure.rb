# 認証失敗時にHTMLリダイレクトせず、JSONを返すためのクラス
class CustomFailure < Devise::FailureApp
  def respond
    # リクエストがJSON形式、またはAPI経由の場合はhttp_auth（401エラー）を返す
    if request.format == :json || request.content_type == 'application/json'
      http_auth
    else
      # それ以外（通常のブラウザアクセスなど）はDevise標準の挙動（ログイン画面へリダイレクト）
      super
    end
  end

  def http_auth
    self.status = 401
    self.content_type = 'application/json'
    self.response_body = {
      status: 'error',
      message: i18n_message
    }.to_json
  end
end