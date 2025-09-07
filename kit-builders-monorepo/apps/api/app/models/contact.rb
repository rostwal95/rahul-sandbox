class Contact < ApplicationRecord
  has_many :contact_tags, dependent: :destroy
  has_many :tags, through: :contact_tags
  validates :email, presence: true
end
