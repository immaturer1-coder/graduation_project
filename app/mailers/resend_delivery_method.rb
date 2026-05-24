class ResendDeliveryMethod
  def initialize(settings = {})
    @api_key = settings[:api_key]
  end

  def deliver!(mail)
    require 'resend'
    
    # グローバル設定とインスタンス変数の両方からキーを確保
    key_to_use = @api_key || ENV['RESEND_API_KEY']
    
    if key_to_use.blank?
      puts "FATAL: No API Key found in delivery method!"
      raise "Resend API Key is missing!"
    end

    Resend.api_key = key_to_use
    puts "DEBUG_DELIVER: Resend.api_key successfully set to: #{key_to_use[0..5]}..."

    params = {
      from: 'noreply@focusflow.jp',
      to: mail.to,
      subject: mail.subject,
      html: mail.html_part&.body&.decoded || mail.body.decoded
    }
    
    begin
      Resend::Emails.send(params)
    rescue => e
      puts "DEBUG_DELIVER: API Exception: #{e.message}"
      raise e
    end
  end
end