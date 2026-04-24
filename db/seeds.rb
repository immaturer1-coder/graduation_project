# This file contains record creation for the development environment.

puts "Cleaning database..."
# 依存関係（has_one / has_many）があるため、子テーブルから削除
FocusRecordDetail.destroy_all if Object.const_defined?(:FocusRecordDetail)
FocusRecord.destroy_all if Object.const_defined?(:FocusRecord)
User.destroy_all

puts "Creating test users..."

# テストユーザー1: 一般ユーザー
user1 = User.create!(
  name: "Test User",
  email: "test@example.com",
  password: "password",
  password_confirmation: "password"
)

# テストユーザー2: デモ用
user2 = User.create!(
  name: "Focus Master",
  email: "demo@example.com",
  password: "password",
  password_confirmation: "password"
)

puts "Creating sample focus records for Test User..."

# 実際のマイグレーション（InitialSchemaBasedOnEr）のカラム名に合わせます
# カラム名: mode, started_at, ended_at, duration_minutes, focus_level, stop_reason, note
3.times do |i|
  record = user1.focus_records.create!(
    duration_minutes: (i + 1) * 25,
    mode: ["Timer", "Focus"].sample,
    started_at: Time.current - (i + 1).days,
    ended_at: Time.current - (i + 1).days + (i + 1).hours,
    focus_level: [3, 4, 5].sample,
    stop_reason: "completed", # 'status' ではなく 'stop_reason' を使用
    note: "Sample session data from seed."
  )

  # 詳細データ（センサーログ用テーブル）も作成
  record.create_focus_record_detail!(
    is_finished: true,
    motion_logs: [
      { t: Time.current.iso8601, angle: 180 },
      { t: (Time.current + 1.minute).iso8601, angle: 175 }
    ]
  )
end

puts "--- Seed Data Summary ---"
puts "Users created: #{User.count}"
puts "FocusRecords created: #{FocusRecord.count}"
puts "FocusRecordDetails created: #{FocusRecordDetail.count}"
puts "Login Email: test@example.com"
puts "Login Password: password"
puts "------------------------"