class Delivery < ApplicationRecord
	belongs_to :contact, optional: true
end
