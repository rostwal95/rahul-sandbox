class ApplicationController < ActionController::API
  before_action :configure_permitted_parameters, if: :devise_controller?
  include ActionController::MimeResponds

  def default_url_options
    { host: ENV.fetch('APP_HOST', 'localhost'), port: ENV.fetch('APP_PORT', 4000) }
  end

  protected
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [])
  end
end
