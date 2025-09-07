class CreateFeatureFlags < ActiveRecord::Migration[7.2]
  def change
    create_table :feature_flags do |t|
      t.string :key, null: false
      t.boolean :enabled, default: false
      t.integer :rollout_pct, default: 100
      t.timestamps
    end
    add_index :feature_flags, :key, unique: true
  end
end
