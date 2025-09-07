Devise.setup do |config|
  config.jwt do |jwt|
    jwt.secret = ENV.fetch('DEVISE_JWT_SECRET', 'changemejwtsecret')
    jwt.dispatch_requests = [
      ['POST', %r{^/v1/auth/sign_in$}]
    ]
    jwt.revocation_requests = [
      ['DELETE', %r{^/v1/auth/sign_out$}]
    ]
    jwt.request_formats = { user: [:json] }
  end
  config.mailer_sender = 'no-reply@example.test'
  require 'devise/orm/active_record'
end
