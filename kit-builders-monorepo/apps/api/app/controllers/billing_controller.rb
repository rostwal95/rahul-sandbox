class BillingController < ApplicationController
  before_action :authenticate_user!, except: [:webhook]

  def ensure_customer
    require 'stripe'
    Stripe.api_key = ENV['STRIPE_SECRET_KEY']
    sub = BillingSubscription.find_or_initialize_by(org_id: 1)
    return sub.customer_id if sub.customer_id.present?
    cust = Stripe::Customer.create({ email: current_user.email })
    sub.update!(customer_id: cust.id)
    cust.id
  end

  def checkout
    if ENV['FAKE_STRIPE'] == 'true'
      fake_url = 'http://localhost:3000/billing?success=true&fake_stripe=1'
      BillingSubscription.find_or_initialize_by(org_id: 1).update!(provider: 'stripe', external_id: 'cust_fake', status: 'active', plan: (params[:price_id] || ENV['STRIPE_DEFAULT_PRICE_ID'] || 'price_fake'))
      return render json: { url: fake_url, fake: true }
    end
    require 'stripe'
    Stripe.api_key = ENV['STRIPE_SECRET_KEY']
    price_id = params[:price_id] || ENV['STRIPE_DEFAULT_PRICE_ID']
    customer = ensure_customer
    session = Stripe::Checkout::Session.create({ customer: customer,
      mode: 'subscription',
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: ENV.fetch('BILLING_SUCCESS_URL', 'http://localhost:3000/billing?success=true'),
      cancel_url: ENV.fetch('BILLING_CANCEL_URL', 'http://localhost:3000/billing?canceled=true')
    })
    render json: { url: session.url }
  rescue => e
    render json: { ok: false, error: e.message }, status: :unprocessable_entity
  end

  def portal
    require 'stripe'
    Stripe.api_key = ENV['STRIPE_SECRET_KEY']
    customer_id = BillingSubscription.find_by(org_id: 1)&.external_id || params[:customer_id]
    return render json: { ok: false, error: 'no customer' }, status: :unprocessable_entity unless customer_id
    sess = Stripe::BillingPortal::Session.create({ customer: customer_id, return_url: ENV.fetch('BILLING_PORTAL_RETURN_URL', 'http://localhost:3000/billing') })
    render json: { url: sess.url }
  end

  def status
    sub = BillingSubscription.find_by(org_id: 1)
    render json: { plan: sub&.plan || 'free', status: sub&.status || 'inactive' }
  end

  def webhook
    if ENV['FAKE_STRIPE'] == 'true'
      # Accept a minimal fake event for tests
      kind = params[:type] || 'customer.subscription.updated'
      if kind.start_with?('customer.subscription')
        BillingSubscription.find_or_initialize_by(org_id: 1).update!(provider: 'stripe', external_id: 'cust_fake', status: 'active', plan: (params[:plan] || 'price_fake'), current_period_end: 30.days.from_now)
      end
      return head :ok
    end
    require 'stripe'
    payload = request.body.read
    sig_header = request.env['HTTP_STRIPE_SIGNATURE']
    endpoint_secret = ENV['STRIPE_WEBHOOK_SECRET']
    begin
      event = Stripe::Webhook.construct_event(payload, sig_header, endpoint_secret)
    rescue JSON::ParserError => e
      return head :bad_request
    rescue Stripe::SignatureVerificationError => e
      return head :unauthorized
    end

    case event['type']
    when 'customer.subscription.updated','customer.subscription.created'
      sub = event['data']['object']
      BillingSubscription.find_or_initialize_by(org_id: 1).update!(
        provider: 'stripe',
        external_id: sub['customer'],
        status: sub['status'],
        plan: sub['items']['data'][0]['price']['id'],
        current_period_end: Time.at(sub['current_period_end'])
      )
    when 'customer.subscription.deleted'
      BillingSubscription.find_or_initialize_by(org_id: 1).update!(status: 'canceled')
    end

    head :ok
  end
end
