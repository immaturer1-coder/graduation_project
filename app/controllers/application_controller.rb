class ApplicationController < ActionController::Base
  # ログイン失敗時などにフラッシュをTurboで即時反映させる
  after_action :enqueue_flash_update, if: -> { response.status >= 400 }

  private

  def enqueue_flash_update
    return unless Array(flash.keys).any?
    
    # ページ遷移なしで #flash の中身を最新のフラッシュメッセージで置き換える
    render turbo_stream: turbo_stream.replace("flash", partial: "shared/flash")
  end
end