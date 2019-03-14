FROM gcr.io/cloud-builders/gcloud-slim

RUN apt-get update && apt-get install -y ruby ruby-dev build-essential zlib1g zlib1g-dev
RUN gem install jekyll bundler

ENTRYPOINT ["bundle"]
