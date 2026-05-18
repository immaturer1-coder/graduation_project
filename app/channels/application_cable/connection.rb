module ApplicationCable
  class Connection < ActionCable::Connection::Base
    identified_by :current_user

    def connect
      self.current_user = find_verified_user
      # 接続成功時にRailsコンソールへ鮮明なログを出力します
      logger.info "[ActionCable Connection] 🔌 接続成功: ユーザーID: #{current_user.id} (#{current_user.email})"
    end

    private

    def find_verified_user
      # 1. Deviseが提供する Warden 認証システムから直接ログインユーザーを特定
      if env['warden']&.user
        env['warden'].user
      # 2. Wardenがミドルウェアスレッドのタイミング等で参照できない場合のセッションキー直接デコード
      elsif (session_key = Rails.application.config.session_options[:key]) &&
            (session_data = cookies.encrypted[session_key]) &&
            (user_id = session_data.with_indifferent_access.dig('warden.user.user.key', 0, 0))
        
        user = User.find_by(id: user_id)
        if user
          user
        else
          logger.error "[ActionCable Connection] ❌ セッションデータからユーザーが見つかりませんでした (ID: #{user_id})"
          reject_unauthorized_connection
        end
      else
        logger.warn "[ActionCable Connection] ⚠️ 未認証ユーザーからのWebSocketアクセスを拒否しました"
        reject_unauthorized_connection
      end
    rescue => e
      logger.error "[ActionCable Connection] 🔥 例外エラーが発生しました: #{e.message}"
      reject_unauthorized_connection
    end
  end
end