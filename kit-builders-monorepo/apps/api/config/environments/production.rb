require "active_support/core_ext/integer/time"
Rails.application.configure do
  config.eager_load = true
  config.consider_all_requests_local = false
  config.action_mailer.delivery_method = :smtp
  if ENV['MAIL_PROVIDER'] == 'sendgrid'
    config.action_mailer.smtp_settings = {
      address: 'smtp.sendgrid.net',
      port: 587,
      user_name: 'apikey',
      password: ENV['SENDGRID_API_KEY'],
      authentication: :plain,
      enable_starttls_auto: true
    }
  else
    # SES SMTP
    config.action_mailer.smtp_settings = {
      address: ENV.fetch('SES_SMTP_ADDRESS', 'email-smtp.us-east-1.amazonaws.com'),
      port: 587,
      user_name: ENV['SES_SMTP_USERNAME'],
      password: ENV['SES_SMTP_PASSWORD'],
      authentication: :login,
      enable_starttls_auto: true
    }
  end
end
