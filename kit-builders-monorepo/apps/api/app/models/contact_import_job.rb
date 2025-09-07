class ContactImportJob < ApplicationRecord
  STATUSES = %w[queued processing completed failed].freeze
  validates :status, inclusion: { in: STATUSES }

  # Store error_samples (text) as JSON array transparently
  def error_samples
    raw = read_attribute(:error_samples)
    return [] if raw.nil? || raw == ''
    JSON.parse(raw) rescue []
  end

  def error_samples=(val)
    write_attribute(:error_samples, Array(val).to_json)
  end
end