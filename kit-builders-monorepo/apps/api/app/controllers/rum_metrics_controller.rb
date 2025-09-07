class RumMetricsController < ApplicationController
  before_action :authenticate_user!

  def summary
    slug = params[:slug]
    from = Time.parse(params[:from]) rescue 7.days.ago
    to = Time.parse(params[:to]) rescue Time.now
    q = Event.where("payload ->> 'kind' = ?", 'rum').where(created_at: from..to)
    q = q.where("payload ->> 'slug' = ?", slug) if slug.present?
    rows = q.limit(10000).pluck(:payload)
    lcp = []; ttfb = []
    rows.each do |p|
      l = (p['lcp'] || p.dig('perf','lcp')).to_f
      t = (p['ttfb'] || p.dig('perf','responseStart').to_f - p.dig('perf','requestStart').to_f).to_f
      lcp << l if l > 0; ttfb << t if t > 0
    end
    render json: { count: rows.size, lcp: { p50: percentile(lcp, 50), p95: percentile(lcp, 95) }, ttfb: { p50: percentile(ttfb, 50), p95: percentile(ttfb, 95) } }
  end

  def series
    slug = params[:slug]
    days = (params[:days] || 14).to_i
    out = []
    days.downto(0) do |i|
      from = i.days.ago.beginning_of_day
      to = i.days.ago.end_of_day
      q = Event.where("payload ->> 'kind' = ?", 'rum').where(created_at: from..to)
      q = q.where("payload ->> 'slug' = ?", slug) if slug.present?
      rows = q.limit(5000).pluck(:payload)
      lcp = []; ttfb = []
      rows.each do |p|
        l = (p['lcp'] || p.dig('perf','lcp')).to_f
        t = (p['ttfb'] || p.dig('perf','responseStart').to_f - p.dig('perf','requestStart').to_f).to_f
        lcp << l if l > 0; ttfb << t if t > 0
      end
      out << { date: from.to_date, lcp_p50: percentile(lcp,50), lcp_p95: percentile(lcp,95), ttfb_p50: percentile(ttfb,50), ttfb_p95: percentile(ttfb,95), count: rows.size }
    end
    render json: out
  end

  def device_breakdown
    slug = params[:slug]
    from = Time.parse(params[:from]) rescue 7.days.ago
    to = Time.parse(params[:to]) rescue Time.now
    q = Event.where("payload ->> 'kind' = ?", 'rum').where(created_at: from..to)
    q = q.where("payload ->> 'slug' = ?", slug) if slug.present?
    rows = q.limit(20000).pluck(:payload)
    h = Hash.new(0)
    rows.each do |p|
      d = (p['device'] || 'unknown').to_s
      h[d] += 1
    end
    render json: h.map { |k,v| { device: k, count: v } }
  end

  private
  def percentile(arr, p)
    return nil if arr.empty?
    s = arr.sort
    k = ((p/100.0) * (s.length - 1)).round
    s[k]
  end
end
