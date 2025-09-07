require 'sidekiq/web'

Rails.application.routes.draw do
  post 'stripe/webhook', to: 'stripe_webhooks#create'
  scope :v1 do
    devise_for :users, path: 'auth', defaults: { format: :json }, controllers: {
      sessions: 'users/sessions',
      registrations: 'users/registrations'
    }
  # Media
  get 'media/unsplash', to: 'media#unsplash'
  resources :pages, only: [:index, :create, :show, :update, :destroy] do
      post :publish, on: :member
      collection { get :slug, to: 'pages#by_slug' }
      resources :blocks, controller: :page_blocks
    end
  # Simple dashboard summary stats
  get 'dashboard/summary', to: 'dashboard#summary'
    resources :broadcasts do
      post :send_now, on: :member
      collection { post :test }
    end
    resources :contacts, only: [:index] do
      collection { post :import }
      get 'import/:id/status', to: 'contacts#import_status', on: :collection
    end
    resources :segments, only: [:index, :create] do
      member { get :evaluate }
    end
    get 'metrics/funnel', to: 'metrics#funnel'
    get 'metrics/deliverability_series', to: 'metrics#deliverability_series'
    get 'metrics/isp_breakdown', to: 'metrics#isp_breakdown'
    get 'metrics/isp_heatmap', to: 'metrics#isp_heatmap'
    get 'metrics/broadcast_series', to: 'metrics#broadcast_series'
    get 'metrics/broadcast_isp_breakdown', to: 'metrics#broadcast_isp_breakdown'
    get 'metrics/broadcast_links', to: 'metrics#broadcast_links'
    get 'metrics/broadcast_url_cohorts', to: 'metrics#broadcast_url_cohorts'
  get 'metrics/broadcast_domain_engagement', to: 'metrics#broadcast_domain_engagement'
  # RUM ingest + metrics
  post 'rum', to: 'rum#create'
  get  'rum/summary', to: 'rum_metrics#summary'
  get  'rum/series', to: 'rum_metrics#series'
  get  'rum/device_breakdown', to: 'rum_metrics#device_breakdown'
    get 'ops/sidekiq_stats', to: 'ops#sidekiq_stats'
    get 'exports/contacts', to: 'exports#contacts'
    get 'exports/analytics_series', to: 'exports#analytics_series'
    get 'exports/segment_contacts', to: 'exports#segment_contacts'
    get 'exports/broadcast_clicks', to: 'exports#broadcast_clicks'
    namespace :webhooks do
      post :ses, to: '/webhooks#ses'
      post :sendgrid, to: '/webhooks#sendgrid'
    end
  # Public subscribe + confirm (double opt-in)
  post 'public/subscribe', to: 'public#subscribe'
  get  'public/confirm', to: 'public#confirm'
    post 'billing/checkout', to: 'billing#checkout'
    post 'billing/webhook', to: 'billing#webhook'
    post 'billing/portal', to: 'billing#portal'
    get 'billing/status', to: 'billing#status'
    resources :events, only: [:create, :index]
    resources :deliveries, only: [:index]
    get 'webhook_events', to: 'webhook_events#index'
    get 'feature_flags', to: 'feature_flags#index'
    post 'feature_flags', to: 'feature_flags#upsert'
    post 'feature_overrides', to: 'feature_overrides#upsert'
    get 'org', to: 'orgs#show'
    post 'org', to: 'orgs#update'
    get 'experiments', to: 'experiments#index'
    post 'experiments', to: 'experiments#upsert'
    get 'experiments/results', to: 'experiments#results'
    get 'experiments/config', to: 'experiments#config'
    get 'experiments/series', to: 'experiments#series'
    post 'webhook_events/replay', to: 'webhook_events#replay'
    post 'webhook_events/replay_all', to: 'webhook_events#replay_all'
    post 'uploads/presign', to: 'uploads#presign'
    post 'uploads/multipart/create', to: 'uploads#multipart_create'
  post 'uploads/multipart/presign_part', to: 'uploads#multipart_presign_part'
  post 'uploads/multipart/list_parts', to: 'uploads#multipart_list_parts'
    post 'uploads/multipart/complete', to: 'uploads#multipart_complete'
    post 'uploads/multipart/abort', to: 'uploads#multipart_abort'
    if Rails.env.development?
      namespace :dev do
        get 'latest_confirmation', to: 'test_helpers#latest_confirmation'
  get 'events', to: 'test_helpers#events'
  post 'upsert_experiment', to: 'test_helpers#upsert_experiment'
      end
    end
  end
  mount Sidekiq::Web => '/admin/sidekiq'
  get "/up", to: proc { [200, {}, ['OK']] }
  get "/health", to: "health#index"
end
