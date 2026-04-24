class FocusRecordDetail < ApplicationRecord
  # FocusRecordに属する (1対1)
  belongs_to :focus_record

  # motion_logsカラム(jsonb型)のデフォルト値を保証
  after_initialize :set_default_motion_logs, if: :new_record?

  private

  def set_default_motion_logs
    self.motion_logs ||= []
  end
end