class EventLogger
  # Simple wrapper for creating analytics/demo events.
  # Usage: EventLogger.emit('page_created', page_id: 1, user_id: 2)
  def self.emit(type, attrs = {})
    payload = { type: type, at: Time.now.utc }.merge(attrs)
    Event.create!(payload: payload)
  rescue => e
    Rails.logger.warn("[EventLogger.emit] #{type} failed: #{e.class}: #{e.message}")
    nil
  end
end
