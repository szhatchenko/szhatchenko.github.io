# DOCKER_BUILDKIT=0 docker build -t developmentontheedge/llama.cpp .

FROM debian:bullseye

RUN mkdir /chat

WORKDIR /chat

ADD websocketd /chat

RUN apt-get -yq update && apt-get -yq upgrade && \
  apt-get -yq --no-install-recommends install \
     build-essential python3-venv git gcc g++ make rtorrent curl wget && \
  apt-get autoremove -yq && \
  rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/ggerganov/llama.cpp

RUN cd llama.cpp && \
  make  && \
  cp main ../main-avx-avx2-fma-f16c-sse3 && \
  rm -f *.o main quantize

RUN ls -lha