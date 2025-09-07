class PublicController < ApplicationController

  def subscribe
    email = params[:email].to_s.strip.downcase
    slug = params[:slug].to_s
    variant = params[:variant].to_s
    ua = request.user_agent.to_s
    device = if ua =~ /iPhone|Android.*Mobile/; 'mobile' elsif ua =~ /iPad|Tablet/; 'tablet' else 'desktop' end
    return render json: { ok: false, error: 'invalid' }, status: :bad_request if email.blank? || !email.include?('@')
    c = Contact.find_or_create_by!(org_id: 1, email: email)
    token = SecureRandom.hex(16)
    ConfirmationToken.create!(contact_id: c.id, slug: slug, variant: variant, token: token, expires_at: 3.days.from_now)
    Event.create!(payload: { kind: 'signup', stage: 'initiated', slug: slug, contact_id: c.id, user_agent: ua, device: device, at: Time.current, variant: variant })
  confirm_path = Rails.application.routes.url_helpers.url_for(controller: 'public', action: 'confirm', only_path: true, t: token)
  Delivery.create!(org_id: 1, contact_id: c.id, broadcast_id: nil, status: 'queued')
  Event.create!(payload: { kind: 'confirm_email_queued', contact_id: c.id, token: token, link: confirm_path, at: Time.current })
    render json: { ok: true, contact_id: c.id }
  end

  def confirm
    tok = ConfirmationToken.find_by(token: params[:t].to_s)
    return render plain: 'Invalid link', status: :not_found unless tok && (tok.expires_at.nil? || tok.expires_at > Time.current) && tok.used_at.nil?
    tok.update!(used_at: Time.current)
    c = tok.contact
    c.update!(confirmed_at: Time.current)
    Event.create!(payload: { kind: 'confirm', slug: tok.slug, contact_id: c.id, at: Time.current, variant: tok.variant })
    WelcomeEmailWorker.perform_async(c.id)
    redirect_to "/p/#{tok.slug}/thanks"
  end
end
