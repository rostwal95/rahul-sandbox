class BroadcastMailer < ApplicationMailer
  default from: 'no-reply@example.test'
  def test_send(email:, subject:, html:)
    @content = html.html_safe
    mail(to: email, subject: subject) do |format|
      format.html { render html: @content }
    end
  end
end
