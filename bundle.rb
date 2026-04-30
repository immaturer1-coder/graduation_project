# プロジェクト内のファイルを一つにまとめるためのスクリプト
# 使い方:
# RBENV_VERSION=3.3.6 ruby bundle.rb app config

# 出力ファイル名を .md に変更
output_filename = "all_my_code.md"

# まとめる対象にする拡張子
targets = [".rb", ".jsx", ".js", ".html.erb", ".css", ".yml", ".ts", ".tsx", ".scss", ".html"]

# 無視するディレクトリやファイル
ignores = [
  "node_modules", 
  ".git", 
  "log", 
  "tmp", 
  "vendor", 
  "db/migrate", 
  "public/assets",
  "bin",
  "storage",
  "yarn.lock",
  "package-lock.json",
  "Gemfile.lock",
  "app/assets/builds" # 自動生成されたビルド済みCSS/JSを除外
]

# 拡張子からMarkdownの言語識別子を判定するマップ
def get_lang(path)
  ext = File.extname(path).downcase
  case ext
  when ".rb" then "ruby"
  when ".js", ".jsx" then "javascript"
  when ".ts", ".tsx" then "typescript"
  when ".yml", ".yaml" then "yaml"
  when ".css", ".scss" then "css"
  when ".html", ".html.erb" then "html"
  else ""
  end
end

search_path = ARGV.empty? ? "**/*" : "{#{ARGV.join(',')}}/**/*"

puts "対象範囲: #{ARGV.empty? ? "プロジェクト全域" : ARGV.join(', ')}"
puts "Markdownとして作業を開始します..."

File.open(output_filename, "w") do |output|
  output.puts "# プロジェクトソースコード集"
  output.puts "生成日時: #{Time.now.strftime('%Y-%m-%d %H:%M:%S')}"
  output.puts "\n> 対象パス: `#{search_path}`"
  output.puts "\n---\n"

  # 指定されたパスを探索
  Dir.glob(search_path).each do |path|
    next if File.directory?(path)
    next if ignores.any? { |ig| path.include?(ig) }
    next unless targets.include?(File.extname(path))
    next if File.size(path) > 150_000 # 150KB制限

    begin
      content = File.read(path)
      lang = get_lang(path)
      
      # Markdown形式で書き出し
      output.puts "### 📂 ファイル: `#{path}`"
      output.puts "```#{lang}"
      output.puts content
      output.puts "```"
      output.puts "\n---\n" # 区切り線
      
      puts "追加済み: #{path}"
    rescue => e
      puts "エラー (スキップ): #{path} - #{e.message}"
    end
  end
end

puts "完了！ '#{output_filename}' にMarkdown形式で出力しました。"