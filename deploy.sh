#! /bin/sh
export PATH=~/.pythonbrew/pythons/Python-2.7.3/bin:$PATH
set -- "${1:-dev}"
parse deploy dailyevents-$1
