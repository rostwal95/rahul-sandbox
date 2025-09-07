class CreateEvents < ActiveRecord::Migration[7.2]
  def change
    create_table :events do |t|
      t.jsonb :payload, default: {}
      t.timestamps
    end
    add_index :events, :created_at
  end
end
