# config/initializers/redis.rb
if ENV['REDIS_URL']
  $redis = Redis.new(
    url: ENV['REDIS_URL'],
    # SSL/TLS接続が必須の場合のオプション
    ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE },
    connect_timeout: 5,
    read_timeout: 5,
    write_timeout: 5
  )
end