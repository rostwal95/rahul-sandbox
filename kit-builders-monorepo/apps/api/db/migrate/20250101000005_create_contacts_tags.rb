class CreateContactsTags < ActiveRecord::Migration[7.2]
  def change
    create_table :contacts do |t|
      t.integer :org_id
      t.string :email, null: false
      t.string :name
      t.boolean :consent, default: true
      t.string :source
      t.timestamps
    end
    add_index :contacts, [:org_id, :email], unique: true

    create_table :tags do |t|
      t.integer :org_id
      t.string :name, null: false
      t.timestamps
    end
    add_index :tags, [:org_id, :name], unique: true

    create_table :contact_tags do |t|
      t.references :contact, null: false, foreign_key: true
      t.references :tag, null: false, foreign_key: true
      t.timestamps
    end
    add_index :contact_tags, [:contact_id, :tag_id], unique: true
  end
end
