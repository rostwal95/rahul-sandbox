class PageBlock < ApplicationRecord
  belongs_to :page
  validates :kind, presence: true
end
