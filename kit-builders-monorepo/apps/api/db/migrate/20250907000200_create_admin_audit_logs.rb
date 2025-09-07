class CreateAdminAuditLogs < ActiveRecord::Migration[7.1]
  def change
    create_table :admin_audit_logs do |t|
      t.string :action, null: false
      t.integer :org_id
      t.jsonb :metadata
      t.datetime :created_at, null: false
    end
    add_index :admin_audit_logs, :action
    add_index :admin_audit_logs, :org_id
  end
end