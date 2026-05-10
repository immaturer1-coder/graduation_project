class StaticPagesController < ApplicationController
  # 認証をスキップし、Reactの入り口（LP）を開放する
  skip_before_action :authenticate_user!, only: [:landing]

  def landing
  end
end