class ContactsController < ApplicationController
  before_action :authenticate_user!

  def index
    render json: Contact.where(org_id: params[:org_id] || 1).limit(200)
  end

  # Async import: enqueue large CSV (optionally gzipped) for background processing
  # Returns job id for polling
  def import
    begin
      require 'csv'
    rescue LoadError => e
      return render json: { ok: false, error: "CSV library unavailable: #{e.message}" }, status: :internal_server_error
    end
    raw = params[:csv]
    return render(json: { ok: false, error: 'csv missing' }, status: :bad_request) unless raw
    data = if raw.respond_to?(:read)
      raw.rewind if raw.respond_to?(:rewind)
      raw.read
    else
      raw.to_s
    end
    max_bytes = (ENV['CONTACTS_IMPORT_MAX_BYTES'] || 20_000_000).to_i
    if data.bytesize > max_bytes
      return render json: { ok: false, error: "file too large (limit #{max_bytes} bytes)" }, status: :payload_too_large
    end
    org_id = (params[:org_id] || 1).to_i
    job = ContactImportJob.create!(org_id: org_id, source_filename: (raw.respond_to?(:original_filename) ? raw.original_filename : nil))
    Storage.store_import_payload(job.id, data)
    ContactImportWorker.perform_async(job.id)
    render json: { ok: true, job_id: job.id }
  end

  # Poll endpoint: GET /contacts/import/:id/status
  def import_status
    job = ContactImportJob.find_by(id: params[:id])
    return render(json: { ok: false, error: 'not found' }, status: :not_found) unless job
    render json: {
      ok: true,
      id: job.id,
      status: job.status,
      created: job.created_count,
      updated: job.updated_count,
      error_count: job.error_count,
      processed_rows: job.processed_rows,
      total_rows: job.total_rows,
      duplicates: (job.error_samples || []).find { |e| e.is_a?(Hash) && e.key?(:duplicates) }&.dig(:duplicates),
      errors: (job.error_samples || []).reject { |e| e.is_a?(Hash) && e.key?(:duplicates) }[0,20],
      started_at: job.started_at,
      finished_at: job.finished_at
    }
  end
end
