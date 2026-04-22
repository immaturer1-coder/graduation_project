class Api::SessionsController < ApplicationController
  # 開発環境かつ認証機能が未マージの間は、認証チェックをスキップする
  skip_before_action :authenticate_user!, if: -> { Rails.env.development? }, raise: false
  
  # APIリクエストにおけるCSRFチェックをスキップ
  skip_before_action :verify_authenticity_token, if: -> { request.format.json? }, raise: false

  def create
    # 認証機能マージ前は User.first を使用し、マージ後は current_user を使用する
    user = current_user || User.first

    if user.nil?
      return render json: { 
        message: "User not found. Please ensure a user exists in the database." 
      }, status: :internal_server_error
    end

    # Userモデルの has_many :sessions を利用してビルド
    @session = user.sessions.build(session_params)

    if @session.save
      render json: { 
        status: 'success',
        message: "Sensor logs saved successfully", 
        id: @session.id 
      }, status: :created
    else
      render json: { 
        status: 'error',
        message: "Failed to save sensor logs", 
        errors: @session.errors.full_messages 
      }, status: :unprocessable_entity
    end
  end

  private

  def session_params
    # JSONB形式のmotion_logsを受け取れるように許可
    params.require(:session).permit(:duration, :mode_type, :status, motion_logs: [:t, :angle])
  end
end