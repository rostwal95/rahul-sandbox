# Demo user
if User.where(email: 'demo@kit.test').none?
  User.create!(email: 'demo@kit.test', password: 'password123', password_confirmation: 'password123')
  puts 'Created user demo@kit.test / password123'
end

# Starter page
page = Page.find_or_create_by!(org_id: 1, slug: 'welcome') do |p|
  p.status = 'draft'
  p.theme_json = { colors: { brand: '#0a0a0a' }, typography: { font: 'system-ui' } }
end
page.page_blocks.find_or_create_by!(kind: 'hero', order: 0) { |b| b.data_json = { headline: 'Join my newsletter', sub: 'Weekly insights' } }
page.page_blocks.find_or_create_by!(kind: 'cta', order: 1)  { |b| b.data_json = { cta: 'Subscribe' } }

Event.create!(payload: { kind: 'page_view', page_slug: 'welcome', at: Time.now })
Event.create!(payload: { kind: 'signup', page_slug: 'welcome', at: Time.now })
