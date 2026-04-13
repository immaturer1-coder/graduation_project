# (Node.js 20系が含まれるDebian Bookwormベースに変更)
FROM ruby:3.2.2-bookworm

# 1. Node.js 20 系の公式レポジトリを追加してインストール
RUN apt-get update -qq && apt-get install -y ca-certificates curl gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install nodejs -y

# 2. 必要なシステムパッケージのインストール
RUN apt-get update -qq && apt-get install -y \
    build-essential \
    libpq-dev \
    sudo

# 3. ホスト側のユーザーIDと合わせるための設定
# (docker-compose側から渡される引数を受け取れるようにします)
ARG USERNAME=ruby
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/apt/sources.list.d/$USERNAME \
    && chmod 0440 /etc/apt/sources.list.d/$USERNAME

WORKDIR /app

# 4. Ruby依存関係のインストール
COPY --chown=$USERNAME:$USERNAME Gemfile Gemfile.lock /app/
RUN bundle install

# 5. JavaScript/CSSツールをグローバルにインストール
RUN npm install -g esbuild tailwindcss @tailwindcss/cli

# 6. ユーザーを切り替えてからソースをコピー
USER $USERNAME
COPY --chown=$USERNAME:$USERNAME . /app

EXPOSE 3000

CMD ["rails", "server", "-b", "0.0.0.0"]