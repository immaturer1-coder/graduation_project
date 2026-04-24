class Hint < ApplicationRecord
  # FocusRecordに属する
  belongs_to :focus_record
  
  # 統計データ(jsonb型)の初期化
  after_initialize :set_default_stats, if: :new_record?

  private

  def set_default_stats
    self.statistical_data ||= {}
  end
end