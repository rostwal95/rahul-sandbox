module WebhookReplayer
  extend self
  def process!(event)
    payload = event.payload
    provider = event.provider
    begin
      # call the same application logic as WebhooksController
      WebhooksController.new.apply_event(payload, provider)
      event.update!(status: 'processed', error: nil)
      true
    rescue => e
      event.update!(status: 'failed', error: e.message)
      false
    end
  end
end
