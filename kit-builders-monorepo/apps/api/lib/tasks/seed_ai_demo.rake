namespace :seed do
  desc 'Generate demo pages and broadcasts with plausible content'
  task ai_demo: :environment do
    org_id = 1
    3.times do |i|
      p = Page.create!(org_id: org_id, slug: "demo-#{i}", theme_json: { colors: { bg: '#0a0a0a', ink: '#ffffff', accent: '#10b981' } })
      Block.create!(page_id: p.id, kind: 'hero', order: 0, data_json: { data: { headline: "Demo #{i} — Grow your audience", sub: "Weekly insights for creators", image: "" } })
      Block.create!(page_id: p.id, kind: 'feature_grid', order: 1, data_json: { data: { title: "What you'll get", items: [ { title: 'Tips', desc: 'Actionable growth tactics' }, { title: 'Tools', desc: 'Reviews of creator tools' } ] } })
      Block.create!(page_id: p.id, kind: 'cta', order: 2, data_json: { data: { text: 'Subscribe free', url: '#' } })
    end
    2.times do |i|
      b = Broadcast.create!(org_id: org_id, subject: "Welcome Series #{i}", html: "<h1>Welcome!</h1><p>Thanks for joining.</p><p><a href='https://example.com'>Visit</a></p>")
      Contact.limit(100).pluck(:id).each do |cid|
        Delivery.create!(org_id: org_id, contact_id: cid, broadcast_id: b.id, status: 'delivered', created_at: Time.now - rand(1..10).days)
      end
    end
    puts 'Seeded AI demo pages and broadcasts.'
  end
end
