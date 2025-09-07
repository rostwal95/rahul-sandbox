class AddStatusToWebhookEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :webhook_events, :status, :string, default: 'stored'
    add_column :webhook_events, :error, :text
  end
end
