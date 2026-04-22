class Session < ApplicationRecord
  belongs_to :user

  # バリデーション
  validates :duration, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :status, presence: true
  validates :mode_type, presence: true
  
  # motion_logs の構造チェック（オプション）
  # JSONの中身が空の場合にデフォルトで空の配列を入れる設定
  after_initialize :set_default_motion_logs, if: :new_record?

  private

  def set_default_motion_logs
    self.motion_logs ||= []
  end
end