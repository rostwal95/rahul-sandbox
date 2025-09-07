class BroadcastSendWorker
  include Sidekiq::Worker
  sidekiq_options queue: :default

  def perform(broadcast_id)
    b = Broadcast.find(broadcast_id)
    # TODO: iterate subscribers; for demo, just send a test email to Mailhog
    BroadcastMailer.test_send(email: 'test@local.test', subject: b.subject, html: b.html).deliver_now
    b.update!(status: 'sent')
  end
end
