class CreateSegmentsDeliveries < ActiveRecord::Migration[7.2]
  def change
    create_table :segments do |t|
      t.integer :org_id
      t.string :name, null: false
      t.jsonb :filter_json, default: {}
      t.timestamps
    end
    add_index :segments, [:org_id, :name], unique: true

    create_table :deliveries do |t|
      t.integer :org_id
      t.integer :broadcast_id
      t.integer :contact_id
      t.string :status, default: 'queued'
      t.datetime :opened_at
      t.datetime :clicked_at
      t.string :bounce_reason
      t.timestamps
    end
    add_index :deliveries, [:broadcast_id, :contact_id], unique: true
  end
end
