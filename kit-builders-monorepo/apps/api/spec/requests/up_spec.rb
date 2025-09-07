require 'rails_helper'
RSpec.describe 'Health', type: :request do
  it 'returns ok' do
    get '/up'
    expect(response).to have_http_status(:ok)
  end
end
