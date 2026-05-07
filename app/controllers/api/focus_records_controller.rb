class Api::FocusRecordsController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def index
    @focus_records = current_user.focus_records
                                .includes(:focus_record_details, :hints)
                                .order(created_at: :desc)
    
    render json: @focus_records.as_json(include: [:focus_record_details, :hints])
  end

  def create
    # 冪等性ガード
    existing_record = current_user.focus_records.find_by(started_at: focus_record_params[:started_at])
    if existing_record
      render json: { 
        status: 'success', 
        id: existing_record.id, 
        message: 'already_saved',
        focus_level: existing_record.focus_level,
        evaluation: existing_record.evaluation
      }, status: :ok
      return
    end

    formatted_params = format_focus_record_params(focus_record_params)
    @focus_record = current_user.focus_records.build(formatted_params)

    if @focus_record.save
      # 保存成功時に詳細情報を返す
      # detailのmotion_logsをパースしてフロントに返す
      motion_logs = @focus_record.focus_record_details.first&.motion_logs
      
      render json: { 
        status: 'success', 
        id: @focus_record.id,
        focus_record: @focus_record.as_json.merge({
          motion_logs: motion_logs
        })
      }, status: :created
    else
      render json: { 
        status: 'error', 
        errors: @focus_record.errors.full_messages 
      }, status: :unprocessable_entity
    end
  rescue => e
    Rails.logger.error "[集中記録 例外発生] #{e.class}: #{e.message}"
    render json: { status: 'error', message: "予期せぬエラーが発生しました" }, status: :internal_server_error
  end

  private

  def focus_record_params
    params.require(:focus_record).permit(
      :mode, :started_at, :ended_at, :duration_minutes, :focus_level, :stop_reason, :note, :evaluation,
      focus_record_details_attributes: [:id, :is_finished, :_destroy, :motion_logs]
    )
  end

  def format_focus_record_params(raw_params)
    params_hash = raw_params.to_h
    # 詳細データの配列化保証
    if params_hash["focus_record_details_attributes"].is_a?(Hash)
      params_hash["focus_record_details_attributes"] = [params_hash["focus_record_details_attributes"]]
    end

    if params_hash["focus_record_details_attributes"].is_a?(Array)
      params_hash["focus_record_details_attributes"].each do |detail|
        if detail["motion_logs"].is_a?(String)
          begin
            detail["motion_logs"] = JSON.parse(detail["motion_logs"])
          rescue JSON::ParserError
            detail["motion_logs"] = []
          end
        end
      end
    end
    params_hash
  end
end