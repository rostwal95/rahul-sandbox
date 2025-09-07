class WebhookEvent < ApplicationRecord
  validates :provider, :event_uid, presence: true
  validates :event_uid, uniqueness: { scope: :provider }
end
