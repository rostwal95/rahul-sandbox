class CreateContactImportJobs < ActiveRecord::Migration[7.1]
  def change
    create_table :contact_import_jobs do |t|
      t.integer :org_id, null: false
      t.string  :status, null: false, default: 'queued' # queued, processing, completed, failed
      t.integer :created_count, default: 0
      t.integer :updated_count, default: 0
      t.integer :error_count,   default: 0
      t.text    :error_samples
      t.string  :source_filename
      t.integer :total_rows
      t.integer :processed_rows, default: 0
      t.datetime :started_at
      t.datetime :finished_at
      t.timestamps
    end
    add_index :contact_import_jobs, :org_id
  end
end