class FeatureFlag < ApplicationRecord; validates :key, presence: true, uniqueness: true; end
