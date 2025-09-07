class CreateExperiments < ActiveRecord::Migration[7.2]
  def change
    create_table :experiments do |t|
      t.string :key, null: false
      t.string :slug
      t.jsonb :variants_json, default: {}
      t.boolean :enabled, default: true
      t.timestamps
    end
    add_index :experiments, :key, unique: true
  end
end
