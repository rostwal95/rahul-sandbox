class FeatureFlagsController < ApplicationController
  before_action :authenticate_user!
  def index
    org_id = (params[:org_id] || 1).to_i
    flags = FeatureFlag.order(:key).to_a
    overrides = FeatureOverride.where(org_id: org_id).index_by(&:key)
    merged = flags.map do |f|
      ov = overrides[f.key]
      { key: f.key, enabled: ov ? ov.enabled : f.enabled, rollout_pct: f.rollout_pct }
    end
    render json: merged
  end
  def upsert
    ff = FeatureFlag.find_or_initialize_by(key: params[:key])
    ff.enabled = ActiveModel::Type::Boolean.new.cast(params[:enabled]) if params.key?(:enabled)
    ff.rollout_pct = params[:rollout_pct].to_i if params.key?(:rollout_pct)
    ff.save!
    render json: ff
  end
end
