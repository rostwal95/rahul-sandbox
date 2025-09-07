class Users::RegistrationsController < Devise::RegistrationsController
  respond_to :json
  private
  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: { ok: true, user: { id: resource.id, email: resource.email } }, status: :created
    else
      render json: { ok: false, errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
end
