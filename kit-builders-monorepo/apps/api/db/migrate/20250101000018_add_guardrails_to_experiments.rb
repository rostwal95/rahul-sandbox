class AddGuardrailsToExperiments < ActiveRecord::Migration[7.2]
  def change
    add_column :experiments, :guardrail_note, :string
    add_column :experiments, :last_evaluated_at, :datetime
  end
end
