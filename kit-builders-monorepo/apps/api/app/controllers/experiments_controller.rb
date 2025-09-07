class ExperimentsController < ApplicationController
  before_action :authenticate_user!
  def index
    render json: Experiment.order(:key)
  end
  def upsert
    e = Experiment.find_or_initialize_by(key: params[:key])
    e.slug = params[:slug] if params[:slug]
    e.variants_json = params[:variants_json] if params[:variants_json]
    e.enabled = ActiveModel::Type::Boolean.new.cast(params[:enabled]) if params.key?(:enabled)
    e.save!
    render json: e
  end
  def results
    # returns CTR on clicks and signup conversions; plus significance and SRM
    key = params[:key]
    slug = params[:slug]
    q_assign = Event.where("payload ->> 'kind' = ?", 'ab_assign')
    q_assign = q_assign.where("payload ->> 'slug' = ?", slug) if slug.present?
    q_click = Event.where("payload ->> 'kind' = ?", 'cta_click')
    q_click = q_click.where("payload ->> 'slug' = ?", slug) if slug.present?
    assign_rows = q_assign.pluck(:payload)
    click_rows = q_click.pluck(:payload)
    signup_rows = Event.where("payload ->> 'kind' = ?", 'signup')
    signup_rows = signup_rows.where("payload ->> 'slug' = ?", slug) if slug.present?
    signup_rows = signup_rows.pluck(:payload)
    assigns = Hash.new(0); clicks = Hash.new(0); signups = Hash.new(0)
    per_device = Hash.new { |h,k| h[k] = Hash.new(0) }
    assign_rows.each{ |p| v=(p['variant']||'unknown'); assigns[v]+=1; per_device[v][p['device']||'unknown'] += 1 }
    click_rows.each{ |p| v=(p['variant']||'unknown'); clicks[v]+=1; per_device[v][p['device']||'unknown_clicks'] += 1 }
    signup_rows.each{ |p| v=(p['variant']||'unknown'); signups[v]+=1; per_device[v][p['device']||'unknown_signups'] += 1 }
    variants = (assigns.keys | clicks.keys | signups.keys)
    out = variants.map do |v|
      a = assigns[v].to_i; c = clicks[v].to_i; s = signups[v].to_i
      { variant: v, assigned: a, clicks: c, ctr: (a>0 ? (c.to_f/a).round(4) : 0.0), signups: s, conv: (a>0 ? (s.to_f/a).round(4) : 0.0), device: per_device[v] }
    end
    # Chi-square for clicks
    chi_click, df_click = chi_square_two_outcome(assigns, clicks)
    p_click = p_value(chi_click, df_click)
    # Chi-square for signups
    chi_signup, df_signup = chi_square_two_outcome(assigns, signups)
    p_signup = p_value(chi_signup, df_signup)
    # SRM check vs configured allocation (if any)
    alloc = Experiment.find_by(slug: slug)&.variants_json&.dig('alloc') || {}
    chi_srm, df_srm = srm_chi_square(assigns, alloc)
    p_srm = p_value(chi_srm, df_srm)
    render json: { variants: out.sort_by{ |r| -r[:conv] }, significance: { clicks: { chi: chi_click, df: df_click, p: p_click }, signups: { chi: chi_signup, df: df_signup, p: p_signup }, srm: { chi: chi_srm, df: df_srm, p: p_srm } } }
  end

  private
  def chi_square_two_outcome(assigns, successes)
    # contingency across k variants, outcomes success/fail
    k = assigns.keys.size
    total_assign = assigns.values.sum
    total_success = successes.values.sum
    total_fail = total_assign - total_success
    chi = 0.0
    assigns.each do |v,a|
      exp_s = (a.to_f * total_success) / [total_assign,1].max
      exp_f = (a.to_f * total_fail) / [total_assign,1].max
      obs_s = successes[v].to_i
      obs_f = a - obs_s
      chi += ((obs_s - exp_s)**2) / [exp_s,1e-9].max
      chi += ((obs_f - exp_f)**2) / [exp_f,1e-9].max
    end
    [chi, k-1]
  end
  def srm_chi_square(assigns, alloc)
    variants = assigns.keys
    total = assigns.values.sum
    chi = 0.0
    variants.each do |v|
      expected = total * (alloc[v].to_f / 100.0)
      expected = total / variants.size.to_f if expected <= 0
      observed = assigns[v].to_f
      chi += ((observed - expected)**2) / [expected,1e-9].max
    end
    [chi, variants.size-1]
  end
  # very rough p-value via survival approx for chi-square
  def p_value(chi, df)
    return 1.0 if df <= 0
    # Using regularized gamma Q(df/2, chi/2) approx via series (naive)
    k = df/2.0; x = chi/2.0
    # Wilson-Hilferty approximation as fallback
    t = ((x/k)**(1/3.0) - (1 - 2/(9*k))) / math_sqrt(2/(9*k))
    1 - normal_cdf(t)
  end
  def normal_cdf(z)
    0.5 * (1 + Math.erf(z/Math.sqrt(2)))
  end
  def math_sqrt(v); Math.sqrt(v); end
end


def config
  slug = params[:slug]
  e = Experiment.find_by(slug: slug)
  if e && e.enabled
    render json: { key: e.key, slug: e.slug, variants: (e.variants_json['variants']||[]), alloc: (e.variants_json['alloc']||{}) }
  else
    render json: { key: nil, slug: slug, variants: [], alloc: {} }
  end
end


  def series
    key = params[:key]; slug = params[:slug]; days = (params[:days]||30).to_i
    out = []
    days.downto(0) do |i|
      from = i.days.ago.beginning_of_day; to = i.days.ago.end_of_day
      assigns = Event.where("payload ->> 'kind' = ?", 'ab_assign'); assigns = assigns.where("payload ->> 'slug' = ?", slug) if slug.present?; assigns = assigns.where(created_at: from..to).pluck(:payload)
      clicks = Event.where("payload ->> 'kind' = ?", 'cta_click'); clicks = clicks.where("payload ->> 'slug' = ?", slug) if slug.present?; clicks = clicks.where(created_at: from..to).pluck(:payload)
      signups = Event.where("payload ->> 'kind' = ?", 'signup'); signups = signups.where("payload ->> 'slug' = ?", slug) if slug.present?; signups = signups.where(created_at: from..to).pluck(:payload)
      buckets = Hash.new { |h,k| h[k] = { assigned: 0, clicks: 0, signups: 0 } }
      assigns.each{ |p| buckets[p['variant']||'unknown'][:assigned]+=1 }
      clicks.each{ |p| buckets[p['variant']||'unknown'][:clicks]+=1 }
      signups.each{ |p| buckets[p['variant']||'unknown'][:signups]+=1 }
      out << { date: from.to_date, variants: buckets }
    end
    render json: out
  end
