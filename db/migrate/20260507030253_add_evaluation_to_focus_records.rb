class AddEvaluationToFocusRecords < ActiveRecord::Migration[7.0]
  def change
    add_column :focus_records, :evaluation, :integer
  end
end
