namespace :demo do
  desc "Load seed data for demo"
  task seed: :environment do
    puts "Seeding demo data..."
    load Rails.root.join("db/seeds.rb")
    puts "Done."
  end
end
