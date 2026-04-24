class FocusRecord < ApplicationRecord
  belongs_to :user
  
  has_one :focus_record_detail, dependent: :destroy

  validates :mode, presence: true
  validates :duration_minutes, presence: true
end