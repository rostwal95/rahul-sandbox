class CreateBroadcasts < ActiveRecord::Migration[7.2]
  def change
    create_table :broadcasts do |t|
      t.integer :org_id
      t.string :subject, null: false
      t.text :html, null: false
      t.string :status, default: 'draft'
      t.datetime :scheduled_at
      t.timestamps
    end
    add_index :broadcasts, :org_id
  end
end
