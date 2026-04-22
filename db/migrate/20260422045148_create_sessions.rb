class CreateSessions < ActiveRecord::Migration[7.0]
  def change
    create_table :sessions do |t|
      t.integer :duration
      t.string :mode_type
      t.string :status
      t.jsonb :motion_logs
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end
  end
end
