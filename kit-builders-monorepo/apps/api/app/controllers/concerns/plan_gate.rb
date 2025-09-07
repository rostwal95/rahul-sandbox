module PlanGate
  extend ActiveSupport::Concern
  included do
    before_action :ensure_plan_allows_feature, only: []
  end

  def ensure_plan_allows_feature
    # Demo: always allow. Implement lookup in BillingSubscription for org_id.
    true
  end
end
