class CreateOrgs < ActiveRecord::Migration[7.2]
  def change
    create_table :orgs do |t|
      t.string :name
      t.string :plan, default: 'Starter'
      t.timestamps
    end
  end
end
