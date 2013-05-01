help:
	@echo
	@echo "Please use 'make <target>' where <target> is one of"
	@echo "  clean      to clean garbage left by builds and installation"
	@echo "  compile    to compile .py files (just to check for syntax errors)"
	@echo "  test       to execute all tests"
	@echo

clean:
	@echo "Cleaning..."
	@rm -rf **/*.pyc

compile: clean
	@echo "Compiling..."
	@rm -rf dailyevents/*.pyc
	@rm -rf test/*.pyc
	@python -tt -m compileall dailyevents
	@python -tt -m compileall test

test: compile
	@make clean
	@echo "Testing..."
	@export PYTHONPATH="$PYTHONPATH:`pwd`"
	@nosetests -s --verbose --with-coverage --cover-erase --cover-package=acceptance test/*
	@make clean
