#! /bin/sh
export PATH=~/.pythonbrew/pythons/Python-3.3.0/bin:$PATH
cd acceptance && make test
