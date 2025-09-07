class BroadcastsController < ApplicationController
  before_action :authenticate_user!
  def index
    render json: Broadcast.all.order(created_at: :desc)
  end
  def show
    render json: Broadcast.find(params[:id])
  end
  def create
    b = Broadcast.create!(broadcast_params)
    render json: b, status: :created
  end
  def update
    b = Broadcast.find(params[:id])
    b.update!(broadcast_params)
    render json: b
  end
  def send_now
    b = Broadcast.find(params[:id])
    BroadcastSendWorker.perform_async(b.id)
    render json: { ok: true, enqueued: true }
  end
  def test
    email = params[:email] || 'test@local.test'
    subject = params[:subject] || 'Test Broadcast'
    html = params[:html] || '<h1>Hello from Kit Builders</h1>'
    BroadcastMailer.test_send(email: email, subject: subject, html: html).deliver_now
    render json: { ok: true }
  end
  private
  def broadcast_params
    params.require(:broadcast).permit(:org_id, :subject, :html, :status, :scheduled_at)
  end
end
