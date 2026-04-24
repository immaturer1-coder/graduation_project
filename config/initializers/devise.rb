# frozen_string_literal: true

# Devise configuration file
Devise.setup do |config|
  # ==> Mailer Configuration
  config.mailer_sender = 'please-change-me-at-config-initializers-devise@example.com'

  # ==> ORM configuration
  require 'devise/orm/active_record'

  # ==> Configuration for any authentication mechanism
  config.case_insensitive_keys = [:email]
  config.strip_whitespace_keys = [:email]
  config.skip_session_storage = [:http_auth]

  # ==> Configuration for :database_authenticatable
  config.stretches = Rails.env.test? ? 1 : 12

  # ==> Configuration for :confirmable
  config.reconfirmable = true

  # ==> Configuration for :rememberable
  config.expire_all_remember_me_on_sign_out = true

  # ==> Configuration for :validatable
  config.password_length = 6..128
  config.email_regexp = /\A[^@\s]+@[^@\s]+\z/

  # ==> Configuration for :recoverable
  config.reset_password_within = 6.hours

  # ==> Navigation configuration
  config.navigational_formats = ['*/*', :html]

  # ==> Hotwire/Turbo configuration
  config.responder.error_status = :unprocessable_entity
  config.responder.redirect_status = :see_other

  config.paranoid = true

  # Custom failure app for JSON/API responses
  require_relative '../../lib/custom_failure'
  config.warden do |warden|
    warden.failure_app = CustomFailure
  end

  # The default HTTP method used to sign out a resource.
  config.sign_out_via = :delete
end