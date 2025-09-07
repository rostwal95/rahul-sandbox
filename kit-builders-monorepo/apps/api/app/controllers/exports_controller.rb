require 'csv'
class ExportsController < ApplicationController
  before_action :authenticate_user!

  def contacts
    contacts = Contact.where(org_id: 1).order(:id).limit(5000)
    send_data to_csv_contacts(contacts), filename: 'contacts.csv', type: 'text/csv'
  end

  def analytics_series
    org_id = 1
    range = 30.days.ago.to_date..Date.today
    series = range.map do |d|
      day = d.beginning_of_day..d.end_of_day
      { date: d, sent: Delivery.where(org_id: org_id, created_at: day).count, opened: Delivery.where(org_id: org_id, opened_at: day).count, clicked: Delivery.where(org_id: org_id, clicked_at: day).count, bounced: Delivery.where(org_id: org_id, status: 'bounced', updated_at: day).count }
    end
    csv = CSV.generate { |out| out << %w[date sent opened clicked bounced]; series.each { |r| out << [r[:date], r[:sent], r[:opened], r[:clicked], r[:bounced]] } }
    send_data csv, filename: 'analytics_series.csv', type: 'text/csv'
  end

  def segment_contacts
    seg = Segment.find_by(id: params[:segment_id])
    contacts = if seg&.filter_json
      SegmentsController.new.send(:apply_filter, Contact.where(org_id: 1), seg.filter_json)
    else
      Contact.where(org_id: 1)
    end
    send_data to_csv_contacts(contacts), filename: "segment_#{seg&.id || 'all'}.csv", type: 'text/csv'
  end

  def broadcast_clicks
    bid = params[:broadcast_id]
    clicks = Event.where("payload ->> 'kind' = ?", 'email_click').where("payload ->> 'broadcast_id' = ?", bid.to_s)
    csv = CSV.generate do |out|
      out << %w[time contact_id url]
      clicks.find_each { |e| out << [e.created_at, e.payload['contact_id'], e.payload['url']] }
    end
    send_data csv, filename: "broadcast_#{bid}_clicks.csv", type: 'text/csv'
  end

  private
  def to_csv_contacts(scope)
    CSV.generate do |out|
      out << %w[id email name created_at]
      scope.find_each { |c| out << [c.id, c.email, (c.name rescue ''), c.created_at] }
    end
  end
end
