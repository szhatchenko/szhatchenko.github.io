#!/bin/bash

echo Model: $1

while read MSG; do 
  RESP=$(./main-avx-avx2-fma-f16c-sse3 -m models/$1 -p "${MSG}" -n 512 2>&1 | grep -o -P '(?<=Выход:).*(?=\[end of text\])')
  echo '> [1m[32m[0m' $RESP '[0m'
done
