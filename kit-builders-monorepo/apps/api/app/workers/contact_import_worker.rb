require 'csv'
require 'zlib'

class ContactImportWorker
  include Sidekiq::Worker
  sidekiq_options queue: :default

  # Args: job_id
  def perform(job_id)
    job = ContactImportJob.find_by(id: job_id)
    return unless job && job.status == 'queued'
    job.update!(status: 'processing', started_at: Time.now)
    begin
      raw = Storage.fetch_import_payload(job_id) # abstract storage (to implement)
      data = maybe_gunzip(raw)
      process_csv_stream(job, data)
      job.update!(status: 'completed', finished_at: Time.now)
      AdminAuditLog.create!(action: 'contact_import.completed', org_id: job.org_id, metadata: {
        job_id: job.id,
        created: job.created_count,
        updated: job.updated_count,
        errors: job.error_count,
        duplicates: extract_duplicates(job)
      })
    rescue => e
      job.update!(status: 'failed', finished_at: Time.now, error_samples: [{ error: e.message }])
      AdminAuditLog.create!(action: 'contact_import.failed', org_id: job&.org_id, metadata: { job_id: job_id, error: e.message })
    end
  end

  private
  def maybe_gunzip(bytes)
    return '' unless bytes
    # GZIP magic 1F 8B
    if bytes.bytes[0,2] == [0x1f, 0x8b]
      Zlib::GzipReader.new(StringIO.new(bytes)).read
    else
      bytes
    end
  rescue Zlib::GzipFile::Error
    bytes # fallback to raw
  end

  def process_csv_stream(job, data)
    io = StringIO.new(data)
    header = nil
    org_id = job.org_id
    duplicates = 0
    seen = {}
    line_no = 0
    while (line = io.gets)
      line_no += 1
      if line_no == 1
        header = CSV.parse_line(line)&.map { |h| h.to_s.strip }
        next
      end
      next if line.strip.empty?
      row_values = CSV.parse_line(line) rescue nil
      next unless row_values
      row = Hash[header.zip(row_values)]
      email = (row['email'] || row['Email'] || row.values.compact.find { |v| v&.include?('@') })&.strip
      next unless email
      if seen[email]
        duplicates += 1
        next
      end
      seen[email] = true
      name = (row['name'] || row['Name'])&.strip
      tags_field = row['tags'] || row['Tags']
      begin
        c = Contact.find_or_initialize_by(org_id: org_id, email: email.downcase)
        is_new = c.new_record?
        c.name = name if name.present?
        if c.changed?
          c.save!
          is_new ? job.created_count += 1 : job.updated_count += 1
        end
        if tags_field.present?
          tags_field.split(/[;|,]/).map(&:strip).reject(&:empty?).each do |tname|
            tag = Tag.find_or_create_by!(name: tname)
            c.tags << tag unless c.tags.exists?(tag.id)
          end
        end
      rescue => e
        job.error_count += 1
        samples = job.error_samples || []
        if samples.size < 20
          samples << { line: line_no, email: email, error: e.message }
        end
        job.error_samples = samples
      end
      job.processed_rows += 1
      if (job.processed_rows % 500).zero?
        job.save!
      end
    end
    job.total_rows = line_no - 1
    job.error_samples ||= []
    job.error_samples << { duplicates: duplicates } if duplicates.positive?
    job.save!
  end

  def extract_duplicates(job)
    (job.error_samples || []).find { |e| e.is_a?(Hash) && e.key?(:duplicates) }&.dig(:duplicates)
  end
end

# Simple in-memory storage placeholder.
module Storage
  @@payloads = {}
  def self.store_import_payload(job_id, data)
    @@payloads[job_id] = data
  end
  def self.fetch_import_payload(job_id)
    @@payloads[job_id]
  end
end