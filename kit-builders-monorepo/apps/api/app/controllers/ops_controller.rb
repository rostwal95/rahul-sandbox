class OpsController < ApplicationController
  before_action :authenticate_user!
  def sidekiq_stats
    s = Sidekiq::Stats.new
    render json: {
      processed: s.processed, failed: s.failed,
      enqueued: s.enqueued, scheduled_size: s.scheduled_size,
      retry_size: s.retry_size, dead_size: s.dead_size, processes_size: s.processes_size,
      default_queue_latency: Sidekiq::Queue.new('default').latency
    }
  end
end
