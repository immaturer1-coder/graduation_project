class Api::AiAnalysisController < ApplicationController
  before_action :authenticate_user!
  
  skip_before_action :verify_authenticity_token

  # 特定のフォーカスレコードに基づき、AI分析を実行しヒントを保存する
  def analyze
    # 【Security/Integrity】自身の所有するレコード以外へのアクセスを遮断
    focus_record = current_user.focus_records.find_by(id: params[:focus_record_id])
    
    if focus_record.nil?
      return render json: { error: 'FOCUS_RECORD_NOT_FOUND' }, status: :not_found
    end

    focus_record.with_lock do
      existing_hint = focus_record.hints.find_by(advice_type: "ai_coach")
      if existing_hint
        return render json: {
          success: true,
          analysis: existing_hint.analysis_report,
          hint_id: existing_hint.id,
          is_cached: true
        }
      end

      # 【Serviceability】機密情報のハイブリッド取得
      api_key = Rails.application.credentials.dig(:gemini, :api_key) || ENV['GEMINI_API_KEY']
      if api_key.blank?
        Rails.logger.error "[AI_ANALYSIS_SECURITY_ALERT] API Key missing while processing record #{focus_record.id}"
        return render json: { error: 'SERVICE_UNAVAILABLE' }, status: :internal_server_error
      end

      # データ抽出
      detail = focus_record.focus_record_details.first
      motion_logs = []
      if detail && detail.motion_logs.present?
        motion_logs = detail.motion_logs.is_a?(String) ? JSON.parse(detail.motion_logs) : detail.motion_logs
      end

      reflection_memo = focus_record.note.presence || "No reflection provided."
      user_lang = params[:language] || 'ja-JP'
      language_instruction = user_lang.start_with?('ja') ? "Japanese" : "English"

      # プロンプト構築
      system_instruction = build_system_instruction(language_instruction)
      combined_prompt = build_user_prompt(focus_record, reflection_memo, motion_logs)

      begin
        service = GeminiService.new(api_key)
        response_text = service.generate_content(combined_prompt, system_instruction)

        hint = focus_record.hints.create!(
          analysis_report: response_text,
          advice_type: "ai_coach"
        )

        render json: {
          success: true,
          analysis: response_text,
          hint_id: hint.id
        }

      rescue => e
        # 【Reliability】エラーログの記録
        Rails.logger.error "[AI_ANALYSIS_FAILURE] Record: #{focus_record.id}, Error: #{e.message}"
        render json: {
          success: false,
          error: 'AI_ANALYSIS_ERROR',
          message: '分析の実行中にエラーが発生しました'
        }, status: :service_unavailable
      end
    end 
  end

  private

  def build_system_instruction(lang)
    <<~TEXT
      You are an expert Focus Coach for "FocusFlow". 
      Analyze the session:
      - Angle ~180: Face down (Deep focus).
      - Angle ~0-90: Face up/Held (Distraction).
      - Output: Summary, pattern identification, one actionable advice.
      - Rule: Response MUST be in #{lang}. Max 200 chars.
    TEXT
  end

  def build_user_prompt(record, memo, logs)
    # 直近30件のログを抽出
    summary = logs.last(30).map { |l| "T:#{l['t']}, A:#{l['angle']}" }.join("\n")
    <<~TEXT
      # Data
      - Duration: #{record.duration_minutes} min
      - Reflection: "#{memo}"
      # Motion
      #{summary}
    TEXT
  end
end