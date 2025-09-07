namespace :seed do
  desc 'Generate a bunch of contacts and deliveries for demo'
  task demo_data: :environment do
    org_id = 1
    domains = %w[gmail.com yahoo.com outlook.com icloud.com example.com company.com]
    500.times do |i|
      email = "user#{i}@#{domains.sample}"
      c = Contact.find_or_create_by!(org_id: org_id, email: email) do |x| x.name = "User #{i}" end
      # random deliveries
      3.times do
        d = Delivery.create!(org_id: org_id, contact_id: c.id, broadcast_id: 1, status: 'delivered', created_at: rand(20).days.ago)
        d.update!(opened_at: d.created_at + rand(1..5).hours) if rand < 0.6
        d.update!(clicked_at: d.created_at + rand(2..10).hours) if rand < 0.2
        d.update!(status: 'bounced') if rand < 0.05
      end
    end
    puts 'Seeded demo contacts and deliveries.'
  end
end
