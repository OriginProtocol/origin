#!/bin/bash

set -e

QUIET=0
DRY=0

function usage() {
  echo "Installs Origin Protocol development environments."
  echo
  echo "Usage:"
  echo "  $0 -e [env] [-h] [-v] [-d]"
  echo
  echo "Options:"
  echo -e "  -e \t The environment to install, origin or origin-website."
  echo -e "  -h \t Show this help."
  echo -e "  -q \t Quiet mode - hide output of all commands."
  echo -e "  -d \t Dry run mode - show the commands that would be executed."
  echo
}

function print_origin_start() {
  echo -e "\033[94mSetting up your Origin Protocol development environment. This will take a few minutes... \033[0m"
  echo
}

function print_origin_finish() {
  echo
  echo -e "\033[97mAll set! Get building... \033[0m"
  echo
  echo -e "Origin-js blockchain is running at \033[94mhttp://localhost:8545\033[0m"
  echo -e "Origin-js tests are running at \033[94mhttp://localhost:8081\033[0m"
  echo -e "Origin-bridge is running at \033[94mhttp://localhost:5000\033[0m"
  echo -e "Origin-dapp is running at \033[94mhttp://localhost:3000\033[0m"
  echo -e "For more help \033[97mdocker-compose -h\033[0m"
  echo -e "To follow the logs run \033[97mdocker-compose logs -f\033[0m"
}

function print_website_start() {
  echo -e "\033[94mSetting up your Origin Protocol website development environment. This will take a few minutes... \033[0m"
  echo
}

function print_website_finish() {
  echo
  echo -e "\033[97mAll set! Get building... \033[0m"
  echo
  echo -e "Origin-website is running at \033[94mhttp://localhost:5000\033[0m"
  echo -e "For more help \033[97mdocker-compose -h\033[0m"
  echo -e "To follow the logs run \033[97mdocker-compose -f docker-compose-web.yml logs -f\033[0m"
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

function install_origin_environment() {
	print_origin_start

	run_step "Cloning origin-js" \
		git clone git@github.com:OriginProtocol/origin-js.git --branch develop || true

	run_step "Cloning origin-bridge" \
		git clone git@github.com:OriginProtocol/origin-bridge.git --branch develop || true

	run_step "Cloning origin-dapp" \
		git clone git@github.com:OriginProtocol/origin-dapp.git --branch develop || true

	run_step "Building containers" \
		docker-compose build --no-cache

	run_step "Bringing up stack" \
		docker-compose up -d &&

	run_step "Compiling contracts" \
		docker-compose exec origin-bridge wait-for.sh -t 0 -q origin-js:8081

	run_step "Configuring database" \
		docker-compose exec origin-bridge flask db upgrade

	print_origin_finish
}


function install_website_environment() {
	print_website_start

	run_step "Cloning origin-website" \
		git clone git@github.com:OriginProtocol/origin-website.git --branch develop || true

	run_step "Building containers" \
	  docker-compose -f docker-compose-web.yml build --no-cache

	run_step "Bringing up stack" \
	  docker-compose -f docker-compose-web.yml up -d

	run_step "Configuring database" \
	  docker-compose -f docker-compose-web.yml exec origin-website flask db upgrade

	print_website_finish
}

	while getopts "e:qdh" opt; do
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

if [ "$ENV" = "origin" ]; then
 	install_origin_environment
elif [ "$ENV" = "origin-website" ]; then
	install_website_environment
else
	usage
fi
