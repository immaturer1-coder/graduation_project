class GeminiService
  require 'net/http'
  require 'json'

  # 開発計画書: 「Gemini API連携基盤 (5SP)」に対応
  # 有料枠 (Tier 1) にて疎通確認済みの構成
  API_VERSION = "v1beta"
  
  # ログ診断により実在が確認された最新の Flash モデルを指定
  # 安定性を考慮し、エイリアス名 (gemini-flash-latest) を採用
  MODEL_NAME = "models/gemini-flash-latest"
  BASE_URL = "https://generativelanguage.googleapis.com/#{API_VERSION}/#{MODEL_NAME}:generateContent"

  def initialize(api_key = ENV['GEMINI_API_KEY'])
    @api_key = api_key
  end

  # PUBLIC: 汎用コンテンツ生成メソッド
  # AiAnalysisController#analyze からの直接呼び出しをサポート
  def generate_content(prompt, system_instruction = nil)
    # APIキーの存在チェック（基盤としてのガード）
    if @api_key.blank?
      raise "Gemini API Key is missing. Please check your .env file."
    end

    execute_api_call(prompt, system_instruction)
  end

  # PUBLIC: 集中セッション分析専用メソッド
  # 将来的に「内省データ」と「動作ログサマリー」を組み合わせて分析する基盤
  def analyze_session(motion_summary, reflection)
    prompt = "以下を分析してください:\n動作サマリー: #{motion_summary}\n内省内容: #{reflection}"
    system_instruction = "あなたは集中力解析の専門家です。ユーザーの動作と内省を比較し、客観的な分析を提供してください。"
    generate_content(prompt, system_instruction)
  end

  private

  # 実際のAPIリクエスト処理（共通ロジック）
  def execute_api_call(prompt, system_instruction)
    uri = URI("#{BASE_URL}?key=#{@api_key}")
    
    payload = {
      contents: [{ parts: [{ text: prompt }] }]
    }
    
    # システム指示（役割定義）が存在する場合のみペイロードに追加
    if system_instruction.present?
      payload[:systemInstruction] = { parts: [{ text: system_instruction }] }
    end

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 30 # タイムアウト設定を明示
    
    request = Net::HTTP::Post.new(uri.request_uri, { 'Content-Type' => 'application/json' })
    request.body = payload.to_json
    
    begin
      response = http.request(request)
      handle_response(response)
    rescue Net::ReadTimeout, Net::OpenTimeout => e
      raise "Gemini API Timeout: #{e.message}"
    rescue => e
      raise "Gemini API Connection Error: #{e.message}"
    end
  end

  # レスポンス判定とパース（共通処理）
  def handle_response(response)
    case response.code
    when "200"
      result = JSON.parse(response.body)
      # 候補が存在しない場合の例外処理
      text = result.dig('candidates', 0, 'content', 'parts', 0, 'text')
      text || raise("Gemini API Error: Content not found in response.")
    when "429"
      # クォータ（利用制限）エラーの明示
      raise "Gemini API Quota Exceeded (429): Too many requests."
    when "404"
      raise "Gemini API Model Not Found (404): Check MODEL_NAME or API_VERSION."
    else
      # その他のエラー（認証失敗、パラメータ不正など）
      raise "Gemini API Error #{response.code}: #{response.body}"
    end
  end
end