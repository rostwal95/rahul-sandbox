class CreateBillingSubscriptions < ActiveRecord::Migration[7.2]
  def change
    create_table :billing_subscriptions do |t|
      t.integer :org_id
      t.string :provider, default: 'stripe'
      t.string :external_id
      t.string :status, default: 'inactive'
      t.string :plan, default: 'free'
      t.datetime :current_period_end
      t.timestamps
    end
    add_index :billing_subscriptions, :org_id
  end
end
