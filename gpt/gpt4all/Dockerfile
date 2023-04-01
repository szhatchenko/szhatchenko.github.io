# docker build -t developmentontheedge/gpt4all .

FROM debian:bullseye

RUN mkdir /chat

WORKDIR /chat

ADD websocketd /chat

RUN apt-get -yq update && apt-get -yq upgrade && \
  apt-get -yq --no-install-recommends install \
     build-essential python3-venv git gcc g++ make rtorrent curl wget && \
  apt-get autoremove -yq && \
  rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/zanussbaum/gpt4all.cpp

RUN cd gpt4all.cpp && \
  make chat AVX1_M=avx AVX2_M=none FMA_M=none F16C_M=f16c SSE3_M=sse3 && \
  mv chat ../chat-avx-f16c-sse3 && \
  rm -f *.o main quantize

RUN cd gpt4all.cpp && \
  make chat AVX1_M=avx AVX2_M=none FMA_M=fma F16C_M=f16c SSE3_M=sse3 && \
  mv chat ../chat-avx-fma-f16c-sse3 && \
  rm -f *.o main quantize

RUN cd gpt4all.cpp && \
  make chat AVX1_M=avx AVX2_M=avx2 FMA_M=fma F16C_M=f16c SSE3_M=sse3 && \
  mv chat ../chat-avx-avx2-fma-f16c-sse3 && \
  rm -f *.o main quantize

RUN ls -lha