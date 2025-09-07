class AddAttemptsToWebhookEvents < ActiveRecord::Migration[7.2]
  def change
    add_column :webhook_events, :attempts, :integer, default: 0, null: false
    add_column :webhook_events, :next_attempt_at, :datetime
    add_column :webhook_events, :last_error, :text
  end
end
