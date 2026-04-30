class Api::FocusRecordsController < ApplicationController
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token

  def create
    # --- 冪等性（二重保存）ガード ---
    # 同一ユーザーが、同じ開始時刻（started_at）の記録を保存しようとした場合、
    # 既に保存済みであればそのレコードを返して終了する。
    existing_record = current_user.focus_records.find_by(started_at: focus_record_params[:started_at])
    if existing_record
      render json: { status: 'success', id: existing_record.id, message: 'already_saved' }, status: :ok
      return
    end
    # ----------------------------

    formatted_params = format_focus_record_params(focus_record_params)
    @focus_record = current_user.focus_records.build(formatted_params)

    if @focus_record.save
      render json: { status: 'success', id: @focus_record.id }, status: :created
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
      :mode, :started_at, :ended_at, :duration_minutes, :focus_level, :stop_reason, :note,
      focus_record_details_attributes: [:id, :is_finished, :_destroy, :motion_logs]
    )
  end

  def format_focus_record_params(raw_params)
    params_hash = raw_params.to_h
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
        detail["motion_logs"] ||= []
      end
    end
    params_hash
  end
end