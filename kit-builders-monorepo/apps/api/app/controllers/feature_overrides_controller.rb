class FeatureOverridesController < ApplicationController
  before_action :authenticate_user!
  def upsert
    fo = FeatureOverride.find_or_initialize_by(org_id: params[:org_id], key: params[:key])
    fo.enabled = ActiveModel::Type::Boolean.new.cast(params[:enabled])
    fo.save!
    render json: fo
  end
end
