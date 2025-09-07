class CreatePageBlocks < ActiveRecord::Migration[7.2]
  def change
    create_table :page_blocks do |t|
      t.references :page, null: false, foreign_key: true
      t.string :kind, null: false
      t.integer :order, default: 0
      t.jsonb :data_json, default: {}
      t.timestamps
    end
    add_index :page_blocks, [:page_id, :order]
  end
end
