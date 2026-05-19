class FocusSessionChannel < ApplicationCable::Channel
  # 接続（購読開始）時に呼ばれる
  def subscribed
    if current_user
      # ログインユーザーごとの個別チャネル（一意のストリーム）を購読開始
      stream_from "focus_session_#{current_user.id}"
    else
      reject
    end
  end

  # スマホ側から「集中開始」のアクションを受け取ったとき
  def start_focus(data)
    broadcast_to_user("start_focus", data)
  end

  # スマホ側から「集中終了」のアクションを受け取ったとき
  def end_focus(data)
    broadcast_to_user("end_focus", data)
  end

  # スマホ側で30秒（本番45分）経過し、マイルストーン通知トリガーが引かれたとき
  def trigger_milestone(data)
    broadcast_to_user("recommend_milestone", data)
  end

  # スマホ側で60秒（本番90分）経過し、休憩レコメンドトリガーが引かれたとき
  def trigger_break_recommend(data)
    broadcast_to_user("recommend_break", data)
  end

  # 接続解除時
  def unsubscribed
    # クリーンアップが必要な場合はここに処理を記述します
  end

  private

  # 同一アカウントのPC・スマホへ向けてWebSocketブロードキャストを行う
  def broadcast_to_user(event, data)
    return unless current_user

    ActionCable.server.broadcast(
      "focus_session_#{current_user.id}",
      {
        event: event,
        payload: data
      }
    )
  end
end