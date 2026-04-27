class Api::AiAnalysisController < ApplicationController
  # 疎通テストのため認証をスキップ。テスト完了後に必ず元に戻すこと。
  # before_action :authenticate_user!

  def analyze
    prompt = params[:prompt]
    system_instruction = params[:system_instruction]

    # キーの読み込みチェック
    if ENV['GEMINI_API_KEY'].blank?
      Rails.logger.error "[AI_ANALYSIS] GEMINI_API_KEY is missing in Rails environment"
      return render json: { error: 'API_KEY_MISSING' }, status: :internal_server_error
    end

    if prompt.blank?
      return render json: { error: 'PROMPT_REQUIRED' }, status: :bad_request
    end

    begin
      service = GeminiService.new
      response_text = service.generate_content(prompt, system_instruction)
      
      render json: { 
        success: true, 
        analysis: response_text 
      }
    rescue => e
      # ログにエラーのクラス、メッセージ、バックトレースを出力
      Rails.logger.error "[AI_ANALYSIS] Exception: #{e.class} - #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      render json: { 
        success: false, 
        error: 'AI_ANALYSIS_ERROR',
        debug_message: e.message # 開発時のみ詳細を返す設定（任意）
      }, status: :internal_server_error
    end
  end
end