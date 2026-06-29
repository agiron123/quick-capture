FROM debian:bookworm-slim AS build

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    cmake \
    git \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /src
RUN git clone --depth 1 --branch v1.7.4 https://github.com/ggml-org/whisper.cpp.git .

RUN cmake -B build -DGGML_NATIVE=OFF -DBUILD_SHARED_LIBS=OFF \
    && cmake --build build --target whisper-server -j"$(nproc)"

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY --from=build /src/build/bin/whisper-server /usr/local/bin/whisper-server
COPY docker/whisper/entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh

ENV WHISPER_MODEL=base.en
ENV WHISPER_PORT=8080
ENV WHISPER_MODELS_DIR=/models

VOLUME ["/models"]
EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
