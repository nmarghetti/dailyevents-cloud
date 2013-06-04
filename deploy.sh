#! /bin/sh
export PATH=~/.pythonbrew/pythons/Python-2.7.3/bin:$PATH

set -- "${1:-dev}"

minifyjs public/js/mobile.js

if [ "$1" == "dev" ]; then
  mv public/index.html public/index-prod.html
  cp public/index-dev.html public/index.html
  parse deploy dailyevents-$1
  rm public/index.html
  mv public/index-prod.html public/index.html
else
  parse deploy dailyevents-$1
fi
