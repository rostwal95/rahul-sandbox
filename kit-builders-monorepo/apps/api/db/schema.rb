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

ActiveRecord::Schema[8.0].define(version: 2025_09_07_000200) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_audit_logs", force: :cascade do |t|
    t.string "action", null: false
    t.integer "org_id"
    t.jsonb "metadata"
    t.datetime "created_at", null: false
    t.index ["action"], name: "index_admin_audit_logs_on_action"
    t.index ["org_id"], name: "index_admin_audit_logs_on_org_id"
  end

  create_table "billing_subscriptions", force: :cascade do |t|
    t.integer "org_id"
    t.string "provider", default: "stripe"
    t.string "external_id"
    t.string "status", default: "inactive"
    t.string "plan", default: "free"
    t.datetime "current_period_end"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "customer_id"
    t.index ["customer_id"], name: "index_billing_subscriptions_on_customer_id"
    t.index ["org_id"], name: "index_billing_subscriptions_on_org_id"
  end

  create_table "broadcasts", force: :cascade do |t|
    t.integer "org_id"
    t.string "subject", null: false
    t.text "html", null: false
    t.string "status", default: "draft"
    t.datetime "scheduled_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["org_id"], name: "index_broadcasts_on_org_id"
  end

  create_table "confirmation_tokens", force: :cascade do |t|
    t.integer "contact_id", null: false
    t.string "slug"
    t.string "variant"
    t.string "token", null: false
    t.datetime "expires_at"
    t.datetime "used_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["token"], name: "index_confirmation_tokens_on_token", unique: true
  end

  create_table "contact_import_jobs", force: :cascade do |t|
    t.integer "org_id", null: false
    t.string "status", default: "queued", null: false
    t.integer "created_count", default: 0
    t.integer "updated_count", default: 0
    t.integer "error_count", default: 0
    t.text "error_samples"
    t.string "source_filename"
    t.integer "total_rows"
    t.integer "processed_rows", default: 0
    t.datetime "started_at"
    t.datetime "finished_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["org_id"], name: "index_contact_import_jobs_on_org_id"
  end

  create_table "contact_tags", force: :cascade do |t|
    t.bigint "contact_id", null: false
    t.bigint "tag_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id", "tag_id"], name: "index_contact_tags_on_contact_id_and_tag_id", unique: true
    t.index ["contact_id"], name: "index_contact_tags_on_contact_id"
    t.index ["tag_id"], name: "index_contact_tags_on_tag_id"
  end

  create_table "contacts", force: :cascade do |t|
    t.integer "org_id"
    t.string "email", null: false
    t.string "name"
    t.boolean "consent", default: true
    t.string "source"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.datetime "confirmed_at"
    t.index ["org_id", "email"], name: "index_contacts_on_org_id_and_email", unique: true
  end

  create_table "deliveries", force: :cascade do |t|
    t.integer "org_id"
    t.integer "broadcast_id"
    t.integer "contact_id"
    t.string "status", default: "queued"
    t.datetime "opened_at"
    t.datetime "clicked_at"
    t.string "bounce_reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["broadcast_id", "contact_id"], name: "index_deliveries_on_broadcast_id_and_contact_id", unique: true
  end

  create_table "events", force: :cascade do |t|
    t.jsonb "payload", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["created_at"], name: "index_events_on_created_at"
  end

  create_table "experiments", force: :cascade do |t|
    t.string "key", null: false
    t.string "slug"
    t.jsonb "variants_json", default: {}
    t.boolean "enabled", default: true
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "guardrail_note"
    t.datetime "last_evaluated_at"
    t.index ["key"], name: "index_experiments_on_key", unique: true
  end

  create_table "feature_flags", force: :cascade do |t|
    t.string "key", null: false
    t.boolean "enabled", default: false
    t.integer "rollout_pct", default: 100
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_feature_flags_on_key", unique: true
  end

  create_table "feature_overrides", force: :cascade do |t|
    t.integer "org_id", null: false
    t.string "key", null: false
    t.boolean "enabled", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["org_id", "key"], name: "index_feature_overrides_on_org_id_and_key", unique: true
  end

  create_table "orgs", force: :cascade do |t|
    t.string "name"
    t.string "plan", default: "Starter"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "page_blocks", force: :cascade do |t|
    t.bigint "page_id", null: false
    t.string "kind", null: false
    t.integer "order", default: 0
    t.jsonb "data_json", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["page_id", "order"], name: "index_page_blocks_on_page_id_and_order"
    t.index ["page_id"], name: "index_page_blocks_on_page_id"
  end

  create_table "pages", force: :cascade do |t|
    t.integer "org_id"
    t.string "slug", null: false
    t.string "status", default: "draft"
    t.jsonb "theme_json", default: {}
    t.datetime "published_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["org_id", "slug"], name: "index_pages_on_org_id_and_slug", unique: true
  end

  create_table "segments", force: :cascade do |t|
    t.integer "org_id"
    t.string "name", null: false
    t.jsonb "filter_json", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["org_id", "name"], name: "index_segments_on_org_id_and_name", unique: true
  end

  create_table "suppressions", force: :cascade do |t|
    t.integer "org_id"
    t.bigint "contact_id"
    t.string "email"
    t.string "provider"
    t.string "reason"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["contact_id"], name: "index_suppressions_on_contact_id"
    t.index ["org_id", "email"], name: "index_suppressions_on_org_id_and_email"
  end

  create_table "tags", force: :cascade do |t|
    t.integer "org_id"
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["org_id", "name"], name: "index_tags_on_org_id_and_name", unique: true
  end

  create_table "users", force: :cascade do |t|
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

  create_table "webhook_events", force: :cascade do |t|
    t.string "provider", null: false
    t.string "event_uid", null: false
    t.jsonb "payload", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "status", default: "stored"
    t.text "error"
    t.integer "attempts", default: 0, null: false
    t.datetime "next_attempt_at"
    t.text "last_error"
    t.index ["provider", "event_uid"], name: "index_webhook_events_on_provider_and_event_uid", unique: true
  end

  add_foreign_key "contact_tags", "contacts"
  add_foreign_key "contact_tags", "tags"
  add_foreign_key "page_blocks", "pages"
  add_foreign_key "suppressions", "contacts"
end
