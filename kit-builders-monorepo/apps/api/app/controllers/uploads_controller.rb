class UploadsController < ApplicationController
  before_action :authenticate_user!
  def presign
    # Development/offline fallback: if no bucket or creds, simulate direct upload to MinIO/public path
    if ENV['S3_EMULATOR'] == 'true' || (ENV['S3_BUCKET'].to_s.empty? || ENV['AWS_ACCESS_KEY_ID'].to_s.empty?)
      bucket = ENV['S3_BUCKET'] || 'dev-bucket'
      key = "uploads/#{SecureRandom.uuid}/#{params[:filename] || 'file'}"
      asset_base = ENV['ASSET_PUBLIC_BASE'] || "http://localhost:9000/#{bucket}"
      # For emulator, client can PUT directly without signed URL (or we could craft a simple unsigned URL)
      put_url = "#{asset_base}/#{key}"
      render json: { url: put_url, headers: { 'Content-Type' => params[:content_type] }, key: key, publicUrl: put_url, emulator: true }
      return
    end
    require 'aws-sdk-s3'
    bucket = ENV['S3_BUCKET']
    region = ENV['AWS_REGION'] || 'us-east-1'
    key = "uploads/#{SecureRandom.uuid}/#{params[:filename] || 'file'}"
    s3 = Aws::S3::Resource.new(region: region,
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'])
    obj = s3.bucket(bucket).object(key)
    url = obj.presigned_url(:put, expires_in: 3600, content_type: params[:content_type] || 'application/octet-stream')
    public_url = "https://#{bucket}.s3.amazonaws.com/#{key}"
    render json: { url: url, headers: { 'Content-Type' => params[:content_type] }, key: key, publicUrl: public_url }
  rescue => e
    render json: { ok: false, error: e.message }, status: :unprocessable_entity
  end

  def multipart_create
    if ENV['S3_EMULATOR'] == 'true' || (ENV['S3_BUCKET'].to_s.empty? || ENV['AWS_ACCESS_KEY_ID'].to_s.empty?)
      # For emulator we can just simulate a multipart (client can do single PUT)
      key = "uploads/#{SecureRandom.uuid}/#{params[:filename] || 'file'}"
      render json: { uploadId: 'emulated', key: key, emulator: true }
      return
    end
    require 'aws-sdk-s3'
    bucket = ENV['S3_BUCKET']
    key = "uploads/#{SecureRandom.uuid}/#{params[:filename] || 'file'}"
    client = Aws::S3::Client.new(region: ENV['AWS_REGION'] || 'us-east-1',
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'])
    resp = client.create_multipart_upload(bucket: bucket, key: key, content_type: params[:content_type] || 'application/octet-stream')
    render json: { uploadId: resp.upload_id, key: key }
  rescue => e
    render json: { ok: false, error: e.message }, status: :unprocessable_entity
  end

  def multipart_list_parts
    if ENV['S3_EMULATOR'] == 'true' || params[:uploadId] == 'emulated'
      render json: { parts: [] }
      return
    end
    require 'aws-sdk-s3'
    client = Aws::S3::Client.new(region: ENV['AWS_REGION'] || 'us-east-1', access_key_id: ENV['AWS_ACCESS_KEY_ID'], secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'])
    parts = client.list_parts(bucket: ENV['S3_BUCKET'], key: params[:key], upload_id: params[:uploadId]).parts.map { |p| { etag: p.etag, partNumber: p.part_number, size: p.size } }
    render json: { parts: parts }
  rescue => e
    render json: { ok:false, error: e.message }, status: :unprocessable_entity
  end

  def multipart_presign_part
    if ENV['S3_EMULATOR'] == 'true' || params[:uploadId] == 'emulated'
      # Return direct PUT URL for emulator
      bucket = ENV['S3_BUCKET'] || 'dev-bucket'
      asset_base = ENV['ASSET_PUBLIC_BASE'] || "http://localhost:9000/#{bucket}"
      url = "#{asset_base}/#{params[:key]}?partNumber=#{params[:partNumber]}"
      render json: { url: url, emulator: true }
      return
    end
    require 'aws-sdk-s3'
    bucket = ENV['S3_BUCKET']
    client = Aws::S3::Client.new(region: ENV['AWS_REGION'] || 'us-east-1',
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'])
    signer = Aws::S3::Presigner.new(client: client)
    url = signer.presigned_url(:upload_part, bucket: bucket, key: params[:key], upload_id: params[:uploadId], part_number: params[:partNumber].to_i, expires_in: 3600)
    render json: { url: url }
  rescue => e
    render json: { ok: false, error: e.message }, status: :unprocessable_entity
  end

  def multipart_complete
    if ENV['S3_EMULATOR'] == 'true' || params[:uploadId] == 'emulated'
      bucket = ENV['S3_BUCKET'] || 'dev-bucket'
      asset_base = ENV['ASSET_PUBLIC_BASE'] || "http://localhost:9000/#{bucket}"
      public_url = "#{asset_base}/#{params[:key]}"
      render json: { ok: true, publicUrl: public_url, emulator: true }
      return
    end
    require 'aws-sdk-s3'
    bucket = ENV['S3_BUCKET']
    client = Aws::S3::Client.new(region: ENV['AWS_REGION'] || 'us-east-1',
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'])
    parts = (params[:parts] || []).map { |p| { etag: p[:etag] || p['etag'], part_number: p[:partNumber] || p['partNumber'] } }
    client.complete_multipart_upload(
      bucket: bucket, key: params[:key], upload_id: params[:uploadId],
      multipart_upload: { parts: parts }
    )
    public_url = "https://#{bucket}.s3.amazonaws.com/#{params[:key]}"
    render json: { ok: true, publicUrl: public_url }
  rescue => e
    render json: { ok: false, error: e.message }, status: :unprocessable_entity
  end

  def multipart_abort
    if ENV['S3_EMULATOR'] == 'true' || params[:uploadId] == 'emulated'
      render json: { ok: true, emulator: true }
      return
    end
    require 'aws-sdk-s3'
    bucket = ENV['S3_BUCKET']
    client = Aws::S3::Client.new(region: ENV['AWS_REGION'] || 'us-east-1',
      access_key_id: ENV['AWS_ACCESS_KEY_ID'],
      secret_access_key: ENV['AWS_SECRET_ACCESS_KEY'])
    client.abort_multipart_upload(bucket: bucket, key: params[:key], upload_id: params[:uploadId])
    render json: { ok: true }
  rescue => e
    render json: { ok: false, error: e.message }, status: :unprocessable_entity
  end
end
