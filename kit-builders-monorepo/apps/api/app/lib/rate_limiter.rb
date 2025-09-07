class RateLimiter
  def self.allowed?(key, limit:, period: 1)
    redis = Redis.new(url: ENV['REDIS_URL'] || 'redis://localhost:6379/0')
    now = Time.now.to_i
    bucket = "rl:#{key}:#{now}"
    count = redis.incr(bucket)
    redis.expire(bucket, period + 1)
    count <= limit
  end
end
