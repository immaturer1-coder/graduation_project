class FocusRecordDetail < ApplicationRecord
  belongs_to :focus_record

  # focus_record_id のユニーク制約について:
  # 新規作成時（IDが確定していない状態）でのバリデーションエラーを避けるため、
  # Railsの inverse_of による関連付けに任せるか、必要に応じて update 時のみ適用します。
  validates :focus_record, presence: true
  
  # 1対1の関係を厳密に保ちたい場合は、以下のバリデーションを有効にします。
  # validates :focus_record_id, uniqueness: true, allow_nil: true, on: :update

  # ログデータが配列形式であることを検証
  validate :motion_logs_must_be_an_array

  # インスタンス化の際にログの初期値を設定
  after_initialize :set_default_motion_logs, if: :new_record?

  private

  # motion_logs が nil の場合に空の配列をセットする
  def set_default_motion_logs
    self.motion_logs ||= []
  end

  # 配列型チェックのバリデーション
  # コントローラ等での加工後、最終的に Array であることを保証します
  def motion_logs_must_be_an_array
    unless motion_logs.is_a?(Array)
      errors.add(:motion_logs, "は配列である必要があります")
    end
  end
end