class WebhookProcessWorker
  include Sidekiq::Worker
  sidekiq_options queue: 'default', retry: 0

  MAX_ATTEMPTS = 5
  BACKOFF = [60, 300, 900, 3600, 14400] # 1m,5m,15m,1h,4h

  def perform(event_id)
    ev = WebhookEvent.find_by(id: event_id)
    return unless ev
    begin
      WebhooksController.new.apply_event(ev.payload, ev.provider)
      ev.update!(status: 'processed', error: nil, last_error: nil)
    rescue => e
      attempts = ev.attempts + 1
      if attempts >= MAX_ATTEMPTS
        ev.update!(status: 'dead', last_error: e.message)
      else
        delay = BACKOFF[[attempts-1, BACKOFF.size-1].min]
        ev.update!(attempts: attempts, status: 'stored', next_attempt_at: Time.now + delay, last_error: e.message)
        WebhookProcessWorker.perform_in(delay, ev.id)
      end
    end
  end
end
