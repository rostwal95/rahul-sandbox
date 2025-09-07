class CreateConfirmationTokens < ActiveRecord::Migration[7.2]
  def change
    create_table :confirmation_tokens do |t|
      t.integer :contact_id, null: false
      t.string :slug
      t.string :variant
      t.string :token, null: false
      t.datetime :expires_at
      t.datetime :used_at
      t.timestamps
    end
    add_index :confirmation_tokens, :token, unique: true
    add_column :contacts, :confirmed_at, :datetime
  end
end
