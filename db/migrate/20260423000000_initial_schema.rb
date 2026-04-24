class InitialSchema < ActiveRecord::Migration[7.0]
  def change
    # UUID拡張機能を有効化 (PostgreSQL)
    enable_extension 'pgcrypto' unless extension_enabled?('pgcrypto')

    # 1. USERS テーブル (ER図 スクリーンショット 141)
    # デバイス認証およびDeviseの標準機能に基づいた構成
    create_table :users, id: :uuid do |t|
      t.string :name,               null: false
      t.string :email,              null: false, default: ""
      t.string :encrypted_password, null: false, default: ""

      ## Recoverable (パスワードリセット用)
      t.string   :reset_password_token
      t.datetime :reset_password_sent_at

      ## Rememberable (ログイン保持用)
      t.datetime :remember_created_at

      t.timestamps null: false
    end

    add_index :users, :email,                unique: true
    add_index :users, :reset_password_token, unique: true

    # 2. FOCUS_RECORDS テーブル (ER図 スクリーンショット 2026-04-23 134656)
    # 集中セッションのヘッダー情報
    create_table :focus_records, id: :uuid do |t|
      t.references :user, type: :uuid, null: false, foreign_key: true
      t.string :mode, null: false # Timer / Focus
      t.datetime :started_at
      t.datetime :ended_at
      t.integer :duration_minutes
      t.integer :focus_level
      t.string :stop_reason
      t.text :note
      t.timestamps
    end

    # 3. FOCUS_RECORD_DETAILS テーブル (ER図 スクリーンショット 143)
    # センサーログ(motion_logs)を含む詳細。1対1のリレーション。
    create_table :focus_record_details, id: :uuid do |t|
      t.references :focus_record, type: :uuid, null: false, foreign_key: true, index: { unique: true }
      t.boolean :is_finished, default: false
      t.jsonb :motion_logs, default: [] # 傾き変化のログをJSON配列で保持
      t.timestamps
    end

    # 4. HINTS テーブル (ER図 スクリーンショット 144)
    # AIによる分析・助言。1セッションに対して複数のヒントが発生しうるため has_many 想定。
    create_table :hints, id: :uuid do |t|
      t.references :focus_record, type: :uuid, null: false, foreign_key: true
      t.string :advice_type
      t.text :analysis_report
      t.jsonb :statistical_data, default: {}
      t.timestamps
    end
  end
end