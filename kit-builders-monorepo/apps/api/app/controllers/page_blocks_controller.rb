class PageBlocksController < ApplicationController
  before_action :authenticate_user!
  before_action :set_page

  def index
    render json: @page.page_blocks.order(:order)
  end

  def create
    block = @page.page_blocks.create!(block_params)
    render json: block, status: :created
  end

  def update
    block = @page.page_blocks.find(params[:id])
    block.update!(block_params)
    render json: block
  end

  def destroy
    block = @page.page_blocks.find(params[:id])
    block.destroy!
    head :no_content
  end

  private
  def set_page
    @page = Page.find(params[:page_id])
  end
  def block_params
    params.require(:block).permit(:kind, :order, :data_json)
  end
end
