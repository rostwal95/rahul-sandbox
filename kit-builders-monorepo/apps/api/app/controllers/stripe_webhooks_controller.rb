class StripeWebhooksController < ApplicationController
  skip_before_action :verify_authenticity_token

  # POST /stripe/webhook
  def create
    payload = request.raw_post
    sig = request.env['HTTP_STRIPE_SIGNATURE']
    secret = Rails.application.credentials.dig(:stripe, :webhook_secret)

    begin
      event = Stripe::Webhook.construct_event(payload, sig, secret)
    rescue JSON::ParserError, Stripe::SignatureVerificationError => e
      Rails.logger.warn("Stripe webhook invalid: #{e.message}")
      return head :bad_request
    end

    # TODO: enqueue a job for async handling
    head :ok
  end
end
