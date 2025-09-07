class MediaController < ApplicationController
  def unsplash
    q = params[:q].presence || 'startup'
    access_key = Rails.application.credentials.dig(:unsplash, :access_key)
    unless access_key
      render json: { error: 'Unsplash access key missing' }, status: 422 and return
    end
    res = Faraday.get('https://api.unsplash.com/search/photos', { query: q, per_page: 9 }, {
      'Authorization' => "Client-ID #{access_key}"
    })
    body = JSON.parse(res.body) rescue { 'results' => [] }
    render json: { results: body['results'].map { |r| { id: r['id'], url: r.dig('urls','small') } } }
  end
end