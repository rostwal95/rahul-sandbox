class WelcomeEmailWorker
  include Sidekiq::Worker
  sidekiq_options queue: 'mailers', retry: 5

  RATE_LIMIT = 1000 # per hour per org

  def perform(contact_id)
    c = Contact.find_by(id: contact_id)
    return unless c
    org_id = c.org_id
    redis = Redis.new(url: ENV['REDIS_URL'] || 'redis://localhost:6379/0')
    key = "rl:welcome:org:#{org_id}:#{Time.now.strftime('%Y%m%d%H')}"
    count = redis.incr(key)
    redis.expire(key, 3700)
    if count.to_i > RATE_LIMIT
      self.class.perform_in(300, contact_id)
      return
    end
    Delivery.create!(org_id: org_id, contact_id: c.id, broadcast_id: nil, status: 'delivered', metadata: { kind: 'welcome' })
    Event.create!(payload: { kind: 'email_sent', subtype: 'welcome', contact_id: c.id, at: Time.current })
  end
end
