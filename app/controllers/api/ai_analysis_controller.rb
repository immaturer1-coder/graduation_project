class Api::AiAnalysisController < ApplicationController
  
  # 特定のフォーカスレコードに基づき、AI分析を実行しヒントを保存する
  def analyze
    # 1. パラメータから対象のレコードを特定
    focus_record = FocusRecord.find_by(id: params[:focus_record_id])
    
    if focus_record.nil?
      return render json: { error: 'FOCUS_RECORD_NOT_FOUND' }, status: :not_found
    end

    # 【重要】データベースの行ロックを取得し、二重発火を物理的に阻止する
    focus_record.with_lock do
      # ロック取得後に改めて存在チェックを行う
      # 待機していた2つ目のリクエストは、ここでもう一方のリクエストが作成したデータを見つけ、即座に返す
      existing_hint = focus_record.hints.find_by(advice_type: "ai_coach")
      if existing_hint
        return render json: {
          success: true,
          analysis: existing_hint.analysis_report,
          hint_id: existing_hint.id,
          is_cached: true
        }
      end

      # 2. 環境変数チェック
      if ENV['GEMINI_API_KEY'].blank?
        Rails.logger.error "[AI_ANALYSIS] GEMINI_API_KEY is missing"
        return render json: { error: 'API_KEY_MISSING' }, status: :internal_server_error
      end

      # 3. データの抽出 (db/schema.rb に基づき修正)
      detail = focus_record.focus_record_details.first
      motion_logs = []
      if detail && detail.motion_logs.present?
        motion_logs = detail.motion_logs.is_a?(String) ? JSON.parse(detail.motion_logs) : detail.motion_logs
      end

      reflection_memo = focus_record.note.present? ? focus_record.note : "No reflection provided."
      
      user_lang = params[:language] || 'ja-JP'
      language_instruction = user_lang.start_with?('ja') ? "Japanese" : "English"

      # 4. プロンプトとシステム指示の構築
      system_instruction = <<~TEXT
        You are an expert Focus Coach for "FocusFlow". 
        Analyze the user's focus session based on smartphone orientation data and their reflection.
        
        - Context: 
          The app UI uses i18next for internationalization. 
          You must output the analysis in the specified language below.
        
        - Data Interpretation:
          - Angle ~180: Phone is face down (Ideal/Deep focus).
          - Angle ~0-90: Phone is face up or held (Distraction/Interruption).
        
        - Objectives:
          - Summarize the focus quality in a short paragraph.
          - Identify patterns (e.g., "Frequent movement detected around 15 minutes in").
          - Provide one clear, actionable advice for the next session.
        
        - Output Rules:
          - Language: Response MUST be in #{language_instruction}.
          - Tone: Encouraging, professional, and insightful.
          - Length: Max 200 characters.
      TEXT

      # ログデータを解析しやすいサマリー形式に変換 (最新30件)
      motion_summary = motion_logs.last(30).map { |log| "T:#{log['t']}, A:#{log['angle']}" }.join("\n")
      
      combined_prompt = <<~TEXT
        # Focus Session Data
        - Duration: #{focus_record.duration_minutes} minutes
        - User Reflection: "#{reflection_memo}"
        
        # Motion Logs (Last 30 samples)
        #{motion_summary}
      TEXT

      begin
        # 5. GeminiService を利用
        service = GeminiService.new
        response_text = service.generate_content(combined_prompt, system_instruction)

        # 6. 分析結果を hints テーブルに保存
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
        Rails.logger.error "[AI_ANALYSIS] Exception: #{e.class} - #{e.message}"
        render json: {
          success: false,
          error: 'AI_ANALYSIS_ERROR',
          message: e.message
        }, status: :internal_server_error
      end
    end # ロック終了
  end
end