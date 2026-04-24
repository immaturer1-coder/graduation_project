module Api
  module V1
    class TranslationsController < ApplicationController
      # 翻訳データは認証前に必要なため、認証をスキップ
      skip_before_action :authenticate_user!

      def index
        # フロントエンドで必要な言語リスト
        languages = [:ja, :en]
        
        resources = languages.each_with_object({}) do |locale, hash|
          # I18n.backend.send(:init_translations) unless I18n.backend.initialized?
          # 全翻訳データをロードし、ネストされたハッシュとして取得
          hash[locale] = {
            translation: I18n.backend.send(:translations)[locale]
          }
        end

        render json: resources
      end
    end
  end
end
