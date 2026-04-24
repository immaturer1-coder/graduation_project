class Api::FocusRecordsController < ApplicationController
  # Deviseの認証を適用
  before_action :authenticate_user!
  
  # JSON形式のリクエストに対してCSRFスキップ（API用途）
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }

  def create
    # FocusRecord と FocusRecordDetail を同時に作成する
    # accepts_nested_attributes_for をモデルに定義しているため、一括保存が可能
    @focus_record = current_user.focus_records.build(focus_record_params)

    if @focus_record.save
      render json: { 
        status: 'success', 
        message: 'Focus session saved successfully',
        id: @focus_record.id 
      }, status: :created
    else
      render json: { 
        status: 'error', 
        errors: @focus_record.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  private

  def focus_record_params
    # ER図に基づいたパラメータ許可
    # focus_record_detail_attributes を通じて、詳細データ（motion_logs）も受け取る
    params.require(:focus_record).permit(
      :mode, 
      :started_at, 
      :ended_at, 
      :duration_minutes, 
      :focus_level, 
      :stop_reason, 
      :note,
      focus_record_detail_attributes: [:is_finished, :motion_logs]
    )
  end
end