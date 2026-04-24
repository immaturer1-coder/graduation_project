# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2026_04_23_000000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pgcrypto"
  enable_extension "plpgsql"

  create_table "focus_record_details", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "focus_record_id", null: false
    t.boolean "is_finished", default: false
    t.jsonb "motion_logs", default: []
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["focus_record_id"], name: "index_focus_record_details_on_focus_record_id", unique: true
  end

  create_table "focus_records", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "user_id", null: false
    t.string "mode", null: false
    t.datetime "started_at"
    t.datetime "ended_at"
    t.integer "duration_minutes"
    t.integer "focus_level"
    t.string "stop_reason"
    t.text "note"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_focus_records_on_user_id"
  end

  create_table "hints", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.uuid "focus_record_id", null: false
    t.string "advice_type"
    t.text "analysis_report"
    t.jsonb "statistical_data", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["focus_record_id"], name: "index_hints_on_focus_record_id"
  end

  create_table "users", id: :uuid, default: -> { "gen_random_uuid()" }, force: :cascade do |t|
    t.string "name", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  add_foreign_key "focus_record_details", "focus_records"
  add_foreign_key "focus_records", "users"
  add_foreign_key "hints", "focus_records"
end
