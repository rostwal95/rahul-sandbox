class SegmentsController < ApplicationController
  before_action :authenticate_user!

  # GET /segments
  def index
    render json: Segment.where(org_id: params[:org_id] || 1)
  end

  # POST /segments
  def create
    seg = Segment.create!(segment_params.merge(org_id: 1))
    render json: seg, status: :created
  end

  # GET /segments/:id/evaluate
  def evaluate
    seg = Segment.find(params[:id])
    scope = Contact.where(org_id: seg.org_id)
    f = seg.filter_json || {}
    if f['email_domain']
      scope = scope.where("email LIKE ?", "%@#{f['email_domain']}")
    end
    if (tags = f['tags']).present?
      scope = scope.joins(:tags).where(tags: { name: tags })
    end
    render json: { count: scope.distinct.count }
  end

  private
  def apply_filter(scope, filter)
    q = scope
    if filter.is_a?(Hash) && filter['rules']
      logic = (filter['logic'] || 'AND').upcase
      rules = filter['rules']
      # Start with none or all depending on logic
      base_ids = logic=='AND' ? scope.pluck(:id) : []
      rules.each do |r|
        field = r['field']
        value = r['value']
        case field
        when 'email_domain'
          ids = Contact.where("email LIKE ?", "%@#{value}").pluck(:id)
        when 'tag'
          ids = Contact.joins(:tags).where(tags: { name: value }).pluck(:id)
        when 'opened_last_days'
          days = value.to_i
          since = days.days.ago
          ids = Delivery.where(org_id: 1).where("opened_at >= ?", since).pluck(:contact_id)
        when 'clicked_last_days'
          days = value.to_i
          since = days.days.ago
          ids = Delivery.where(org_id: 1).where("clicked_at >= ?", since).pluck(:contact_id)
        when 'opened_not_clicked_last_days'
          days = value.to_i; since = days.days.ago
          openers = Delivery.where(org_id: 1).where("opened_at >= ?", since).pluck(:contact_id)
          clickers = Delivery.where(org_id: 1).where("clicked_at >= ?", since).pluck(:contact_id)
          ids = openers - clickers
        when 'did_not_open_last_days'
          days = value.to_i; since = days.days.ago
          all = Contact.where(org_id: 1).pluck(:id)
          openers = Delivery.where(org_id: 1).where("opened_at >= ?", since).pluck(:contact_id)
          ids = all - openers
        else
          ids = []
        end
        base_ids = logic=='AND' ? (base_ids & ids) : (base_ids | ids)
      end
      q = scope.where(id: base_ids)
    elsif filter.is_a?(Hash)
      if filter['email_domain']
        q = q.where("email LIKE ?", "%@#{filter['email_domain']}")
      end
      if (tags = filter['tags']).present?
        q = q.joins(:tags).where(tags: { name: tags })
      end
    end
    q
  end
  def segment_params
    params.require(:segment).permit(:name, filter_json: {})
  end
end
