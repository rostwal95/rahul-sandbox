FROM ruby:3.4-alpine3.20
ENV BUNDLE_PATH=/usr/local/bundle \
	RAILS_ENV=development \
	NODE_ENV=development

RUN apk add --no-cache build-base postgresql-dev postgresql-client tzdata git yaml-dev bash
WORKDIR /app

COPY Gemfile Gemfile.lock ./
RUN bundle lock --add-platform aarch64-linux-musl || true \
 && bundle lock --add-platform x86_64-linux-musl || true \
 && bundle install --jobs=4 --retry=3

COPY . .
RUN chmod +x bin/dev-docker || true

EXPOSE 4000
CMD ["sh","bin/dev-docker"]
