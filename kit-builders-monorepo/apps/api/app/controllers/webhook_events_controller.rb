class WebhookEventsController < ApplicationController
  before_action :authenticate_user!
  def index
    render json: WebhookEvent.order(created_at: :desc).limit(200)
  end
  def replay
    ev = WebhookEvent.find(params[:id])
    WebhookProcessWorker.perform_async(ev.id)
    render json: { ok: true }
  end
  def replay_all
    scope = WebhookEvent.all
    if params[:from].present? && params[:to].present?
      scope = scope.where(created_at: Time.parse(params[:from])..Time.parse(params[:to]))
    else
      scope = WebhookEvent.where(status: 'stored')
      scope = scope.or(WebhookEvent.where(status: 'dead')) if params[:include_dead] == '1'
    end
    count = 0
    scope.find_each do |ev|
      WebhookProcessWorker.perform_async(ev.id)
      count += 1
    end
    render json: { ok: true, enqueued: count }
  end
end
