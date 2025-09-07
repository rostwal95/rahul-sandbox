require 'json'
require 'ed25519'
require 'base64'
require 'aws-sdk-sns'

class WebhooksController < ApplicationController
  require 'redis'
  require_relative '../lib/rate_limiter'
  skip_before_action :verify_authenticity_token, raise: false

  # SendGrid Event Webhook verification per docs:
  # Headers: HTTP_X_TWILIO_EMAIL_EVENT_WEBHOOK_SIGNATURE and HTTP_X_TWILIO_EMAIL_EVENT_WEBHOOK_TIMESTAMP
  def sendgrid
    pubkey = ENV['SENDGRID_PUBLIC_KEY'] # base64-encoded Ed25519 public key
    unless pubkey
      return head :precondition_failed
    end

    signature = request.env['HTTP_X_TWILIO_EMAIL_EVENT_WEBHOOK_SIGNATURE']
    timestamp = request.env['HTTP_X_TWILIO_EMAIL_EVENT_WEBHOOK_TIMESTAMP']
    body = request.raw_post

    begin
      verify_sendgrid!(pubkey, timestamp, body, signature)
    rescue => e
      return head :unauthorized
    end

    events = JSON.parse(body) rescue []
    events = [events] unless events.is_a?(Array)
    events.each do |ev|
      uid = ev['sg_message_id'] || [ev['email'], ev['timestamp'], ev['event']].compact.join(':')
      next unless store_idempotent!('sendgrid', uid, ev)
      apply_event(ev, 'sendgrid')
    end
    head :ok
  end

  # SES via SNS — verify SNS signature
  def ses
    verifier = Aws::SNS::MessageVerifier.new
    raw = JSON.parse(request.raw_post) rescue {}
    if raw['Signature'] && !verifier.authentic?(request.raw_post)
      return head :unauthorized
    end

    # For demo: SNS may wrap the SES message in 'Message' field as JSON
    message = raw['Message'] ? JSON.parse(raw['Message']) rescue {} : raw
    records = message['mail'] ? [message] : [message]
    records.each do |ev|
      uid = ev['mail'] ? ev.dig('mail','messageId') : ev['MessageId'] || ev['eventType']
      next unless store_idempotent!('ses', uid, ev)
      apply_event(ev, 'ses')
    end
    head :ok
  end

  private

  def store_idempotent!(provider, uid, payload)
    return false unless uid
    WebhookEvent.create!(provider: provider, event_uid: uid, payload: payload)
    true
  rescue ActiveRecord::RecordNotUnique
    false
  end

  def verify_sendgrid!(pubkey_b64, timestamp, body, signature_b64)
    data = "#{timestamp}#{body}"
    pk = Base64.decode64(pubkey_b64)
    sig = Base64.decode64(signature_b64)
    verify_key = Ed25519::VerifyKey.new(pk)
    verify_key.verify(sig, data)
    true
  end

  def apply_event(ev, provider)
    # Normalize to { contact_id, broadcast_id, status, ... } where possible
    status = case provider
      when 'sendgrid'
        ev['event'] # open, click, bounce, delivered, processed
      when 'ses'
        (ev['eventType'] || ev['notificationType'])
      else
        ev['event']
      end

    # Find delivery (demo heuristics)
    delivery = if ev['contact_id'] && ev['broadcast_id']
      Delivery.find_by(contact_id: ev['contact_id'], broadcast_id: ev['broadcast_id'])
    else
      # try matching by email and most recent broadcast
      email = ev['email'] || ev.dig('mail','destination')&.first
      c = email && Contact.find_by(email: email, org_id: 1)
      c && Delivery.where(contact_id: c.id).order(created_at: :desc).first
    end
    return unless delivery

    case status&.downcase
    when 'open'
      delivery.update!(opened_at: Time.current, status: 'opened')
    when 'click'
      delivery.update!(clicked_at: Time.current, status: 'clicked')
    when 'bounce'
      reason = ev.dig('bounce','bounceSubType') || ev.dig('bounce','bouncedRecipients',0,'diagnosticCode')
      delivery.update!(status: 'bounced', bounce_reason: reason)
    when 'delivered','delivery'
      delivery.update!(status: 'delivered')
    else
      # ignore other events for now
    end

    if %w[bounce bounced].include?(status.to_s.downcase)
      email = ev['email'] || ev.dig('mail','destination')&.first
      if email
        contact = Contact.find_by(email: email, org_id: 1)
        Suppression.create!(org_id: 1, contact: contact, email: email, provider: provider, reason: (ev.dig('bounce','bounceSubType') rescue nil))
      end
    end
  end
end
