class HealthController < ApplicationController
  def index
    db_ok = true
    redis_ok = true
    begin
      ActiveRecord::Base.connection.execute('SELECT 1')
    rescue => e
      db_ok = false
    end
    begin
      require 'redis'
      Redis.new(url: ENV.fetch('REDIS_URL','redis://localhost:6379/0')).ping
    rescue => e
      redis_ok = false
    end
    render json: { ok: db_ok && redis_ok, db: db_ok, redis: redis_ok }
  end
end
