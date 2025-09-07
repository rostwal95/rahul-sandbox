class CreateFeatureOverrides < ActiveRecord::Migration[7.2]
  def change
    create_table :feature_overrides do |t|
      t.integer :org_id, null: false
      t.string :key, null: false
      t.boolean :enabled, default: false
      t.timestamps
    end
    add_index :feature_overrides, [:org_id, :key], unique: true
  end
end
