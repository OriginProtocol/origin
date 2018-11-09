#!/bin/bash

set -e

CLEAN=0
DRY=0
QUIET=0

function usage() {
  echo "Installs Origin Protocol development environments."
  echo
  echo "Usage:"
  echo "  $0 -e [env] [-h] [-v] [-d]"
  echo
  echo "Options:"
  echo -e "  -d \t Dry run mode - show the commands that would be executed."
  echo -e "  -h \t Show this help."
  echo -e "  -q \t Quiet mode - hide output of all commands."
  echo
}

function print_start() {
  echo -e "\033[94mSetting up your Origin Protocol development environment. This will take a few minutes... \033[0m"
  echo
}

function print_finish() {
  echo
  echo -e "\033[97mAll set! Get building... \033[0m"
  echo
  echo -e "Origin-js blockchain is running at \033[94mhttp://localhost:8545\033[0m"
  echo -e "Origin-bridge is running at \033[94mhttp://localhost:5000\033[0m"
  echo -e "Origin-dapp is running at \033[94mhttp://localhost:3000\033[0m"
  echo -e "For more help \033[97mdocker-compose -h\033[0m"
  echo -e "To follow the logs run \033[97mdocker-compose logs -f\033[0m"
}

function run_step() {
  printf "\033[97m%-24s\033[0m" "$1"
  shift

  [ $QUIET -eq 1 ] && out="> /dev/null 2>&1"
  [ $DRY -eq 1 ] && dry="echo"

  if [ $QUIET -eq 0 ] ; then
    echo -e ""
  fi

  eval "$dry $@ $out"
  wait

  # Only display a tick if in quiet mode
  if [ $QUIET -eq 1 ] ; then
    echo -e "\033[97m ✓\033[0m"
  fi
}

function install_environment() {
  print_start

  run_step "Building containers" \
    docker-compose build

  run_step "Starting containers..." \
    docker-compose up -d

  print_finish
}


while getopts "e:cqdh" opt; do
  case $opt in
    e)
      ENV=$OPTARG
      ;;
    q)
      QUIET=1
      ;;
    d)
      DRY=1
      ;;
    h)
      usage
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

echo -e "\033[31mDoing cleanup... \033[0m"
echo
if [ "$DRY" = 0 ]; then
  docker kill $(docker ps -aq) >/dev/null 2>&1 || true
  docker system prune --all --volumes
fi
echo

install_environment
