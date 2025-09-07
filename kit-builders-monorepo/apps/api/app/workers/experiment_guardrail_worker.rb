class ExperimentGuardrailWorker
  include Sidekiq::Worker
  sidekiq_options queue: 'default', retry: 1

  def perform(key=nil)
    exps = key ? Experiment.where(key: key) : Experiment.all
    exps.find_each do |e|
      slug = e.slug
      assigns = Event.where("payload ->> 'kind' = ?", 'ab_assign'); assigns = assigns.where("payload ->> 'slug' = ?", slug) if slug.present?; assigns = assigns.pluck(:payload)
      signups = Event.where("payload ->> 'kind' = ?", 'signup'); signups = signups.where("payload ->> 'slug' = ?", slug) if slug.present?; signups = signups.pluck(:payload)
      a = Hash.new(0); s = Hash.new(0)
      assigns.each{ |p| a[p['variant']||'unknown']+=1 }
      signups.each{ |p| s[p['variant']||'unknown']+=1 }
      vars = a.keys | s.keys
      next if vars.size < 2
      alloc = e.variants_json['alloc'] || {}
      chi, df = srm_chi(a, alloc)
      p = chi_p(chi, df)
      if p < 0.01
        e.update!(enabled: false, guardrail_note: 'SRM detected; auto-paused', last_evaluated_at: Time.current); next
      end
      conv = vars.map{ |v| [v, (a[v]>0 ? s[v].to_f/a[v] : 0.0)] }.to_h
      best = conv.values.max; worst = conv.values.min
      if best > 0 && worst < best*0.5
        chi2, df2 = chi_two_outcome(a, s); p2 = chi_p(chi2, df2)
        if p2 < 0.05
          e.update!(enabled: false, guardrail_note: 'Underperforming variant; auto-paused', last_evaluated_at: Time.current); next
        end
      end
      e.update!(guardrail_note: nil, last_evaluated_at: Time.current) unless e.guardrail_note.nil?
    end
  end

  private
  def srm_chi(assigns, alloc)
    vars = assigns.keys; total = assigns.values.sum; chi=0.0
    vars.each do |v|
      exp = total * (alloc[v].to_f / 100.0); exp = total / vars.size.to_f if exp <= 0
      obs = assigns[v].to_f
      chi += ((obs-exp)**2) / [exp,1e-9].max
    end
    [chi, vars.size-1]
  end
  def chi_two_outcome(assigns, successes)
    k = assigns.keys.size; total_assign = assigns.values.sum; total_success = successes.values.sum; total_fail = total_assign - total_success; chi=0.0
    assigns.each do |v,a|
      exp_s = (a.to_f * total_success) / [total_assign,1].max
      exp_f = (a.to_f * total_fail) / [total_assign,1].max
      obs_s = successes[v].to_i; obs_f = a - obs_s
      chi += ((obs_s-exp_s)**2)/[exp_s,1e-9].max + ((obs_f-exp_f)**2)/[exp_f,1e-9].max
    end
    [chi, k-1]
  end
  def chi_p(chi, df)
    return 1.0 if df<=0
    k=df/2.0; x=chi/2.0
    t = ((x/k)**(1/3.0) - (1 - 2/(9*k))) / Math.sqrt(2/(9*k))
    1 - (0.5 * (1 + Math.erf(t/Math.sqrt(2))))
  end
end
