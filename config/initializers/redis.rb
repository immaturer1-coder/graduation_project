# 環境変数 REDIS_URL があればそれを使用し、なければローカルのRedisを指定
redis_url = ENV['REDIS_URL'] || 'redis://redis:6379/1'

$redis = Redis.new(
  url: redis_url,
  # URLが rediss:// で始まる（SSL接続）場合のみ ssl_params を適用
  ssl_params: redis_url.start_with?('rediss://') ? { verify_mode: OpenSSL::SSL::VERIFY_NONE } : nil,
  connect_timeout: 5,
  read_timeout: 5,
  write_timeout: 5
)