class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :focus_records, dependent: :destroy

  validates :name, presence: true
end