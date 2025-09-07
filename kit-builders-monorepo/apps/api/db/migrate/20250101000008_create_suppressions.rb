class CreateSuppressions < ActiveRecord::Migration[7.2]
  def change
    create_table :suppressions do |t|
      t.integer :org_id
      t.references :contact, foreign_key: true
      t.string :email
      t.string :provider
      t.string :reason
      t.timestamps
    end
    add_index :suppressions, [:org_id, :email]
  end
end
