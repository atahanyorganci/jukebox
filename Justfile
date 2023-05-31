set dotenv-load

AUTHOR := "atahanyorganci"
IMAGE_NAME := "jukebox"

build:
    docker build -t {{ AUTHOR }}/{{ IMAGE_NAME }} .

run:
    docker run -d \
        -e BOT_TOKEN="$BOT_TOKEN" \
        -e API_KEY="$API_KEY" \
        -e PREFIX="$PREFIX" \
        {{ AUTHOR }}/{{ IMAGE_NAME }}:latest
