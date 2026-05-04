class FocusRecord < ApplicationRecord
  belongs_to :user

  # FocusRecordDetailとのリレーション
  has_many :focus_record_details, dependent: :destroy, inverse_of: :focus_record
  
  # Hintモデルとのリレーションを追加
  has_many :hints, dependent: :destroy

  # ネストされた属性を受け入れる設定
  accepts_nested_attributes_for :focus_record_details, allow_destroy: true

  # バリデーション
  validates :mode, presence: true
  validates :duration_minutes, presence: true, numericality: { greater_than_or_equal_to: 0 }
  validates :started_at, presence: true, uniqueness: { scope: :user_id, message: "は既にこのユーザーで記録されています" }
  validates :focus_record_details, presence: true
  validates_associated :focus_record_details
end