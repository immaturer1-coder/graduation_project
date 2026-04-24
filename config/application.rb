require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module App
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 7.0

    # デフォルトのロケールを日本語に設定
    config.i18n.default_locale = :ja
    
    # 複数のロケールファイルを読み込むための設定（オプション）
    config.i18n.load_path += Dir[Rails.root.join('config', 'locales', '**', '*.{rb,yml}').to_s]

    # libディレクトリを読み込み対象に追加
    config.autoload_paths << Rails.root.join('lib')
  end
end