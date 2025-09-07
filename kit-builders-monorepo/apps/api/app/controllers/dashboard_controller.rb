class DashboardController < ApplicationController
  before_action :authenticate_user!

  # Lightweight aggregate data for dashboard cards/checklist.
  def summary
    org_id = 1 # TODO: derive from current_user/org context when multi-org supported

    pages_count = Page.where(org_id: org_id).count
    contacts_count = defined?(Contact) ? Contact.where(org_id: org_id).count : 0
    broadcasts_count = defined?(Broadcast) ? Broadcast.where(org_id: org_id).count : 0

    # Basic checklist heuristics
    checklist = {
      profile: true, # placeholder
      page: pages_count > 0,
      email: broadcasts_count > 0,
      publish: Page.where(org_id: org_id, status: 'published').exists?,
    }

    stats = {
      subscribers: contacts_count,
      avg_open: 0.42, # placeholder until metrics aggregated
      deliverability: 0.97, # placeholder
      active_flags: 0,
    }

    recent = Page.order(updated_at: :desc).limit(5).map do |p|
      { type: 'page', title: p.slug, id: p.id, at: p.updated_at }
    end

    render json: {
      creator: { name: current_user&.email || 'You' },
      checklist: checklist,
      stats: stats,
      recent: recent,
    }
  end
end
