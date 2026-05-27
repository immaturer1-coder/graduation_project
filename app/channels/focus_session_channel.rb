class FocusSessionChannel < ApplicationCable::Channel
  # 接続（購読開始）時に呼ばれる
  def subscribed
    if current_user
      # ログインユーザーごとの個別チャネル（一意のストリーム）を購読開始
      stream_from "focus_session_#{current_user.id}"
      
      # 接続時に連携状態を通知する
      is_pc_ready = pc_connection_established?(current_user)
      
      ActionCable.server.broadcast(
        "focus_session_#{current_user.id}",
        {
          event: "sync_status",
          payload: { is_linked: is_pc_ready, pc_ready: is_pc_ready }
        }
      )
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

  # スマホ側で30分経過し、マイルストーン通知トリガーが引かれたとき
  def trigger_milestone(data)
    broadcast_to_user("recommend_milestone", data)
  end

  # スマホ側で45分経過し、休憩レコメンドトリガーが引かれたとき
  def trigger_break_recommend(data)
    broadcast_to_user("recommend_break", data)
  end

  # 接続解除時
  def unsubscribed
    if current_user
      ActionCable.server.broadcast(
        "focus_session_#{current_user.id}",
        {
          event: "sync_status",
          payload: { is_linked: false, pc_ready: false }
        }
      )
    end
  end

  private

  # 現在のセッションにおけるPC側との接続状況を確認する
  def pc_connection_established?(user)
    # サーバー内の全コネクションを走査し、同一ユーザーのPC接続が存在するかを確認する
    ActionCable.server.connections.any? do |connection|
      connection.current_user&.id == user.id
    end
  end

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