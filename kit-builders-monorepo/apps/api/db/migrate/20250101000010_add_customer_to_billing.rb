class AddCustomerToBilling < ActiveRecord::Migration[7.2]
  def change
    add_column :billing_subscriptions, :customer_id, :string
    add_index :billing_subscriptions, :customer_id
  end
end
