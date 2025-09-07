class Page < ApplicationRecord
  has_many :page_blocks, dependent: :destroy
  validates :slug, presence: true
  validates :slug, uniqueness: { scope: :org_id, case_sensitive: false }

  before_validation :normalize_slug

  private

  def normalize_slug
    return if slug.blank?
    self.slug = slug.to_s.parameterize
  end
end
