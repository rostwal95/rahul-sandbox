require "active_support/core_ext/integer/time"
Rails.application.configure do
  config.cache_classes = false
  config.eager_load = false
  config.consider_all_requests_local = true
  config.action_controller.perform_caching = false
  config.active_storage.service = :local
  config.active_support.report_deprecations = true
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.file_watcher = ActiveSupport::EventedFileUpdateChecker
  config.action_mailer.delivery_method = :smtp
  config.action_mailer.smtp_settings = { address: 'mailhog', port: 1025 }
  config.action_mailer.default_url_options = { host: 'localhost', port: 4000 }
end
