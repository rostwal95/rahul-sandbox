class CreatePages < ActiveRecord::Migration[7.2]
  def change
    create_table :pages do |t|
      t.integer :org_id
      t.string :slug, null: false
      t.string :status, default: 'draft'
      t.jsonb :theme_json, default: {}
      t.datetime :published_at
      t.timestamps
    end
    add_index :pages, [:org_id, :slug], unique: true
  end
end
