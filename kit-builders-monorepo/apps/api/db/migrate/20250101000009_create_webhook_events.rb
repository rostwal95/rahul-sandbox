class CreateWebhookEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :webhook_events do |t|
      t.string :provider, null: false
      t.string :event_uid, null: false
      t.jsonb :payload, default: {}
      t.timestamps
    end
    add_index :webhook_events, [:provider, :event_uid], unique: true
  end
end
