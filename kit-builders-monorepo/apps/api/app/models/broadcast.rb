class Broadcast < ApplicationRecord
  validates :subject, presence: true
  validates :html, presence: true
end
