class FocusRecord < ApplicationRecord
  belongs_to :user

  # FocusRecordDetailとのリレーション
  # schema.rbのユニーク制約により、論理的には1対1
  has_many :focus_record_details, dependent: :destroy, inverse_of: :focus_record

  # ネストされた属性を受け入れる設定
  accepts_nested_attributes_for :focus_record_details, allow_destroy: true

  # 基本的な属性のバリデーション
  validates :mode, presence: true
  
  # テスト用途を考慮し、0分以上の数値を許可
  validates :duration_minutes, presence: true, numericality: { greater_than_or_equal_to: 0 }

  # 二重送信の防止: user_id と started_at の組み合わせが重複しないように制限
  # 急激な連打や重複リクエストによるデータの不整合を防ぐ
  validates :started_at, presence: true, uniqueness: { scope: :user_id, message: "は既にこのユーザーで記録されています" }

  # 詳細データが少なくとも1つ存在することを保証
  validates :focus_record_details, presence: true
  validates_associated :focus_record_details
end