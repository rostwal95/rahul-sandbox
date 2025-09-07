# Enable cookie sessions for API-only app to support Sidekiq::Web CSRF protection
Rails.application.config.session_store :cookie_store, key: '_kit_session'
Rails.application.config.middleware.use ActionDispatch::Cookies
Rails.application.config.middleware.use ActionDispatch::Session::CookieStore, key: '_kit_session'
