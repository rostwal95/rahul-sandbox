class EventsController < ApplicationController
  before_action :authenticate_user!

  def index
    contact_id = params[:contact_id]
    if contact_id
      render json: Event.where("payload ->> 'contact_id' = ?", contact_id.to_s).order(created_at: :desc).limit(200)
    else
      render json: Event.order(created_at: :desc).limit(200)
    end
  end

  def create
    e = Event.create!(payload: params[:payload] || {})
    render json: e, status: :created
  end
end
