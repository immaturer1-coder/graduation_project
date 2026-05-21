class RedisHealthChecksController < ApplicationController
  # ここでRedisとの接続状況をチェックします
  def show
    begin
      # $redisという「Redisとの窓口」があるか確認
      if defined?($redis) && $redis
        $redis.ping # 繋がっていたら「PONG」という返事が返ってきます
        render plain: "【成功】Redisとバッチリ繋がっています！"
      else
        render plain: "【エラー】$redisという窓口が見当たりません。"
      end
    rescue => e
      # 接続に失敗した理由を表示します
      render plain: "【失敗】接続できませんでした。理由: #{e.message}"
    end
  end
end