class OrgsController < ApplicationController
  before_action :authenticate_user!
  def show
    org = Org.first || Org.create!(name: 'Demo Org', plan: 'Starter')
    render json: org
  end
  def update
    org = Org.first || Org.create!(name: 'Demo Org', plan: 'Starter')
    org.update!(plan: params[:plan]) if params[:plan]
    render json: org
  end
end
