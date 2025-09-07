class RumController < ApplicationController
  skip_before_action :verify_authenticity_token
  def create
    payload = params.permit!.to_h
    Event.create!(payload: payload.merge(kind: 'rum'))
    render json: { ok: true }
  end
end
