class DeliveriesController < ApplicationController
  before_action :authenticate_user!
  def index
    scope = Delivery.includes(:contact).where(org_id: 1)
    if params[:contact_id].present?
      scope = scope.where(contact_id: params[:contact_id])
    end
    render json: scope.order(created_at: :desc).limit(200).map { |d|
      {
        id: d.id,
        contact_id: d.contact_id,
        broadcast_id: d.broadcast_id,
        status: d.status,
        created_at: d.created_at,
        opened_at: d.opened_at,
        clicked_at: d.clicked_at,
        bounce_reason: d.bounce_reason
      }
    }
  end
end
