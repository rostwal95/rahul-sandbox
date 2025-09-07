class MetricsController < ApplicationController
  before_action :authenticate_user!

  def funnel
    org_id = 1
    views = Event.where("payload ->> 'kind' = ?", 'page_view').count
    signups = Event.where("payload ->> 'kind' = ?", 'signup').count
    sends = Delivery.where(org_id: org_id).count
    opens = Delivery.where(org_id: org_id).where.not(opened_at: nil).count
    clicks = Delivery.where(org_id: org_id).where.not(clicked_at: nil).count
    render json: { views: views, signups: signups, sends: sends, opens: opens, clicks: clicks }
  end

  def deliverability_series
    org_id = 1
    seg = params[:segment_id].presence && Segment.find_by(id: params[:segment_id])
    contacts_scope = Contact.where(org_id: org_id)
    if seg&.filter_json.present?
      contacts_scope = apply_segment_filter(contacts_scope, seg.filter_json)
    end
    cids = contacts_scope.select(:id)
    range = 14.days.ago.to_date..Date.today
    series = range.map do |d|
      day = d.beginning_of_day..d.end_of_day
      scope = Delivery.where(org_id: org_id, contact_id: cids)
      {
        date: d,
        sent: scope.where(created_at: day).count,
        opened: scope.where(opened_at: day).count,
        clicked: scope.where(clicked_at: day).count,
        bounced: scope.where(status: 'bounced', updated_at: day).count
      }
    end
    render json: series
  end

  def isp_breakdown
    org_id = 1
    seg = params[:segment_id].presence && Segment.find_by(id: params[:segment_id])
    contacts_scope = Contact.where(org_id: org_id)
    if seg&.filter_json.present?
      contacts_scope = apply_segment_filter(contacts_scope, seg.filter_json)
    end
    rows = Delivery.joins(:contact).merge(contacts_scope)
      .group("split_part(contacts.email, '@', 2)").count
    out = rows.map { |domain, cnt| { domain: domain, count: cnt } }.sort_by { |r| -r[:count] }.first(10)
    render json: out
  end

  def isp_heatmap
    org_id = 1
    seg = params[:segment_id].presence && Segment.find_by(id: params[:segment_id])
    contacts_scope = Contact.where(org_id: org_id)
    contacts_scope = apply_segment_filter(contacts_scope, seg.filter_json) if seg&.filter_json.present?
    rows = Delivery.joins(:contact).merge(contacts_scope)
      .pluck("split_part(contacts.email,'@',2)", :status)
    # Aggregate status per domain
    hash = Hash.new { |h,k| h[k] = Hash.new(0) }
    rows.each { |domain, status| hash[domain][status] += 1 }
    render json: hash.map { |domain, stats| stats.merge(domain: domain) }
  end

  def broadcast_series
    org_id = 1
    bid = params[:broadcast_id]
    range = 14.days.ago.to_date..Date.today
    series = range.map do |d|
      day = d.beginning_of_day..d.end_of_day
      scope = Delivery.where(org_id: org_id, broadcast_id: bid)
      {
        date: d,
        sent: scope.where(created_at: day).count,
        opened: scope.where(opened_at: day).count,
        clicked: scope.where(clicked_at: day).count,
        bounced: scope.where(status: 'bounced', updated_at: day).count
      }
    end
    render json: series
  end

  def broadcast_isp_breakdown
    org_id = 1
    bid = params[:broadcast_id]
    rows = Delivery.joins(:contact).where(org_id: org_id, broadcast_id: bid)
                   .group("split_part(contacts.email,'@',2)").count
    out = rows.map { |domain, cnt| { domain: domain, count: cnt } }
             .sort_by { |r| -r[:count] }.first(10)
    render json: out
  end

  def broadcast_links
    org_id = 1
    bid = params[:broadcast_id]
    clicks = Event.where("payload ->> 'kind' = ?", 'email_click')
                  .where("payload ->> 'broadcast_id' = ?", bid.to_s)
    rows = clicks.group("payload ->> 'url'").count
    sent = Delivery.where(org_id: org_id, broadcast_id: bid).count
    opened = Delivery.where(org_id: org_id, broadcast_id: bid).where.not(opened_at: nil).count
    clicked = Delivery.where(org_id: org_id, broadcast_id: bid).where.not(clicked_at: nil).count
    out = rows.map { |url, cnt| { url: url, clicks: cnt } }
             .sort_by { |r| -r[:clicks] }.first(50)
    render json: { sent: sent, opened: opened, clicked: clicked, links: out }
  end

  def broadcast_url_cohorts
    org_id = 1
    bid = params[:broadcast_id]
    clicks = Event.where("payload ->> 'kind' = ?", 'email_click')
                  .where("payload ->> 'broadcast_id' = ?", bid.to_s)
    url_to_clickers = Hash.new { |h,k| h[k] = Set.new }
    first_url_for_contact = {}
    clicks.find_each do |ev|
      url = ev.payload['url']
      cid = ev.payload['contact_id'] || ev.payload['contactId']
      next unless url && cid
      url_to_clickers[url] << cid
      first_url_for_contact[cid] ||= url
    end
    sent = Delivery.where(org_id: org_id, broadcast_id: bid).count
    opened = Delivery.where(org_id: org_id, broadcast_id: bid).where.not(opened_at: nil).count
    rows = clicks.group("payload ->> 'url'").count
    by_domain = Hash.new { |h,k| h[k] = { unique_clickers: 0, total_clicks: 0 } }
    rows.each do |url, total|
      host = URI(url).host rescue 'unknown'
      uniq = url_to_clickers[url].size
      by_domain[host][:unique_clickers] += uniq
      by_domain[host][:total_clicks] += total
    end
    out = rows.map do |url, total|
      uniq = url_to_clickers[url].size
      first = first_url_for_contact.values.count { |u| u == url }
      { url: url, total_clicks: total, unique_clickers: uniq, first_click_attributed: first, ctr: (uniq.to_f / [sent,1].max).round(4) }
    end.sort_by { |r| -r[:unique_clickers] }.first(50)
    dom = by_domain.map { |host, h| { domain: host, unique_clickers: h[:unique_clickers], total_clicks: h[:total_clicks], ctr: (h[:unique_clickers].to_f / [sent,1].max).round(4) } }
                   .sort_by { |r| -r[:unique_clickers] }
    render json: { sent: sent, opened: opened, links: out, domains: dom }
  end

  def broadcast_domain_engagement
    org_id = 1
    bid = params[:broadcast_id]
    begin
      scope = Delivery.joins(:contact).where(org_id: org_id, broadcast_id: bid)
      domains = scope.group("split_part(contacts.email,'@',2)").count.keys
      join_mode = true
    rescue ActiveRecord::ConfigurationError, ActiveRecord::StatementInvalid
      # Fallback: assume deliveries table directly stores contact_email column or payload json (not shown) – extract via deliveries.email if exists
      join_mode = false
      if Delivery.column_names.include?("contact_email")
        scope = Delivery.where(org_id: org_id, broadcast_id: bid)
        domains = scope.where.not(contact_email: nil)
                       .pluck("distinct split_part(contact_email,'@',2)")
      else
        # As a last resort yield empty
        scope = Delivery.none
        domains = []
      end
    end
    out = domains.map do |dom|
      if join_mode
        s = scope.where("split_part(contacts.email,'@',2) = ?", dom)
      else
        s = Delivery.where(org_id: org_id, broadcast_id: bid)
        if Delivery.column_names.include?("contact_email")
          s = s.where("split_part(contact_email,'@',2) = ?", dom)
        end
      end
      sent = s.count
      opened = s.where.not(opened_at: nil).count
      clicked = s.where.not(clicked_at: nil).count
      bounced = s.where(status: 'bounced').count
      open_rate = (opened.to_f / [sent,1].max).round(4)
      bounce_rate = (bounced.to_f / [sent,1].max).round(4)
      signal = if bounce_rate > 0.08
        'red'
      elsif open_rate < 0.05
        'yellow'
      else
        'green'
      end
      { domain: dom, sent: sent, opened: opened, clicked: clicked, bounced: bounced, open_rate: open_rate, bounce_rate: bounce_rate, signal: signal }
    end
    render json: out.sort_by { |r| -r[:sent] }[0,50]
  end

  private
  def apply_segment_filter(scope, filter)
    q = scope
    if filter.is_a?(Hash) && filter['rules']
      logic = (filter['logic'] || 'AND').upcase
      rules = filter['rules']
      base_ids = logic=='AND' ? scope.pluck(:id) : []
      rules.each do |r|
        field = r['field']; value = r['value']
        case field
        when 'email_domain'
          ids = Contact.where("email LIKE ?", "%@#{value}").pluck(:id)
        when 'tag'
          ids = Contact.joins(:tags).where(tags: { name: value }).pluck(:id)
        when 'opened_last_days'
          days = value.to_i; since = days.days.ago
          ids = Delivery.where(org_id: 1).where("opened_at >= ?", since).pluck(:contact_id)
        when 'clicked_last_days'
          days = value.to_i; since = days.days.ago
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
end
