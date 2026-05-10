class GeminiService
  require 'net/http'
  require 'json'

  API_VERSION = "v1beta"
  MODEL_NAME = "models/gemini-flash-latest"
  BASE_URL = "https://generativelanguage.googleapis.com/#{API_VERSION}/#{MODEL_NAME}:generateContent"

  # Rails Credentials を最優先し、次に環境変数を参照する設計
  def initialize(api_key = nil)
    @api_key = api_key || Rails.application.credentials.dig(:gemini, :api_key) || ENV['GEMINI_API_KEY']
  end

  # PUBLIC: 汎用コンテンツ生成メソッド
  def generate_content(prompt, system_instruction = nil)
    if @api_key.blank?
      raise "Gemini API Key is missing. Please set 'gemini: api_key' in credentials.yml.enc using Docker command."
    end

    execute_api_call(prompt, system_instruction)
  end

  # PUBLIC: 集中セッション分析専用メソッド
  def analyze_session(motion_summary, reflection)
    prompt = "以下を分析してください:\n動作サマリー: #{motion_summary}\n内省内容: #{reflection}"
    system_instruction = "あなたは集中力解析の専門家です。ユーザーの動作と内省を比較し、客観的な分析を提供してください。"
    generate_content(prompt, system_instruction)
  end

  private

  def execute_api_call(prompt, system_instruction)
    uri = URI("#{BASE_URL}?key=#{@api_key}")
    
    payload = {
      contents: [{ parts: [{ text: prompt }] }]
    }
    
    if system_instruction.present?
      payload[:systemInstruction] = { parts: [{ text: system_instruction }] }
    end

    http = Net::HTTP.new(uri.host, uri.port)
    http.use_ssl = true
    http.read_timeout = 30 
    
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

  def handle_response(response)
    case response.code
    when "200"
      result = JSON.parse(response.body)
      text = result.dig('candidates', 0, 'content', 'parts', 0, 'text')
      text || raise("Gemini API Error: Content not found in response.")
    when "429"
      raise "Gemini API Quota Exceeded (429): Too many requests."
    when "404"
      raise "Gemini API Model Not Found (404): Check MODEL_NAME or API_VERSION."
    else
      raise "Gemini API Error #{response.code}: #{response.body}"
    end
  end
end