class PagesController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show, :by_slug]

  def index
    render json: Page.all
  end

  def show
    page = Page.find(params[:id])
    if params[:with] == 'blocks'
      render json: page.as_json.merge(blocks: page.page_blocks.order(:order))
    else
      render json: page
    end
  end

  def by_slug
    page = Page.find_by!(slug: params[:slug])
    render json: page.as_json(include: :page_blocks)
  end

  def create
    begin
      attrs = page_params.to_h.symbolize_keys
      # Provide safe defaults if client omitted
      attrs[:status] ||= 'draft'
      attrs[:theme_json] ||= {}
      attrs[:org_id] ||= 1
      page = Page.new(attrs)
      if page.save
        render json: page, status: :created
      else
        Rails.logger.warn("[pages#create] validation errors=#{page.errors.full_messages.inspect} params=#{attrs.inspect}")
        render json: { errors: page.errors.full_messages.presence || ["Create failed"] }, status: :unprocessable_entity
      end
    rescue ActionController::ParameterMissing => e
      Rails.logger.error("[pages#create] param missing: #{e.message}")
      render json: { errors: ["Bad request: #{e.param} missing"] }, status: :bad_request
    rescue => e
      Rails.logger.error("[pages#create] exception #{e.class}: #{e.message}\n#{e.backtrace&.first(5)&.join("\n")}")
      render json: { errors: ["Create failed"] }, status: :internal_server_error
    end
  end

  def update
    begin
      page = Page.find(params[:id])
      safe = page_params.to_h.symbolize_keys
      page.update!(safe)
      render json: page
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["Not found"] }, status: :not_found
    rescue => e
      Rails.logger.error("[pages#update] #{e.class}: #{e.message}")
      render json: { errors: ["Update failed"] }, status: :unprocessable_entity
    end
  end

  def publish
    begin
      page = Page.find(params[:id])
      page.update!(status: 'published', published_at: Time.now)
      render json: { ok: true, slug: page.slug }
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["Not found"] }, status: :not_found
    rescue => e
      Rails.logger.error("[pages#publish] #{e.class}: #{e.message}")
      render json: { errors: ["Publish failed"] }, status: :unprocessable_entity
    end
  end

  def destroy
    begin
      page = Page.find(params[:id])
      page.destroy!
      head :no_content
    rescue ActiveRecord::RecordNotFound
      render json: { errors: ["Not found"] }, status: :not_found
    rescue => e
      Rails.logger.error("[pages#destroy] exception #{e.class}: #{e.message}")
      render json: { errors: ["Delete failed"] }, status: :unprocessable_entity
    end
  end

  private

  def page_params
    params.require(:page).permit(:org_id, :slug, :status, :theme_json)
  end
end
