#!/bin/bash

set -e

VERBOSE=0
DRY=0

function print_help() {
  echo "Sets up origin-develop."
  echo
  echo "Usage:"
  echo "  $0 [-h] [-v] [-d]"
  echo
  echo "Options:"
  echo -e "  -h \t For usage help."
  echo -e "  -v \t Verbose mode - show output of all commands."
  echo -e "  -d \t Dry run mode - show the commands that would be executed."
  echo
}

function print_hi() {
  echo
  echo -e "\033[94m Setting up your Origin Protocol website development environment. This will take a few minutes... \033[0m"
  echo
}

function print_bye() {
  echo
  echo -e "\033[97m All set! Get building... \033[0m"
  echo
  echo -e " Origin-website is running at \033[94mhttp://localhost:5000\033[0m"
  echo -e " For more help \033[97mdocker-compose -h\033[0m"
  echo -e " To follow the logs run \033[97mdocker-compose logs -f\033[0m"
  echo
}

function run_step() {
  printf " \033[97m%-24s\033[0m" "$1"
  shift

  [ $VERBOSE -eq 0 ] && out="> /dev/null 2>&1"
  [ $DRY -eq 1 ] && dry="echo"

  eval "$dry $@ $out"
  wait

  if [ $VERBOSE -eq 0 ] ; then
    echo -e "\033[97m ✓\033[0m"
  fi
}

while getopts ":vdh" opt; do
  case $opt in
    v)
      VERBOSE=1
      ;;
    d)
      DRY=1
      ;;
    h)
      print_help
      exit 0
      ;;
    \?)
      echo "Invalid option: -$OPTARG" >&2
      exit 1
      ;;
    :)
      echo "Option -$OPTARG requires an argument." >&2
      exit 1
      ;;
  esac
done

print_hi

run_step "Cloning repository" &&
	test -d origin-website || git clone https://github.com/OriginProtocol/origin-website.git --branch develop

run_step "Building containers" \
  docker-compose -f docker-compose-web.yml build --no-cache

run_step "Bringing up stack" \
  docker-compose -f docker-compose-web.yml up -d

run_step "Configuring database" \
  docker-compose -f docker-compose-web.yml exec origin-website flask db upgrade

print_bye
