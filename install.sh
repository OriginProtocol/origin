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
  echo -e "  -c \t Clean - clean up all containers and volumes first'"
  echo -e "  -d \t Dry run mode - show the commands that would be executed."
  echo -e "  -e \t The environment to install, origin or origin-website."
  echo -e "  -h \t Show this help."
  echo -e "  -q \t Quiet mode - hide output of all commands."
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
		git clone git@github.com:OriginProtocol/origin-js.git --branch stable || true

	run_step "Cloning origin-bridge" \
		git clone git@github.com:OriginProtocol/origin-bridge.git --branch stable || true

	run_step "Cloning origin-dapp" \
		git clone git@github.com:OriginProtocol/origin-dapp.git --branch stable || true

	run_step "Building containers" \
		docker-compose build

	run_step "Bringing up stack" \
		docker-compose up -d

	run_step "Configuring database" \
		docker-compose exec origin-bridge flask db upgrade

	run_step "Waiting for container startup" \
		docker-compose exec origin-dapp wait-for.sh -t 0 -q origin-dapp:3000

	print_origin_finish
}


function install_website_environment() {
	print_website_start

	run_step "Cloning origin-website" \
		git clone git@github.com:OriginProtocol/origin-website.git --branch stable || true

	run_step "Building containers" \
	  docker-compose -f docker-compose-web.yml build

	run_step "Bringing up stack" \
	  docker-compose -f docker-compose-web.yml up -d

	run_step "Configuring database" \
	  docker-compose -f docker-compose-web.yml exec origin-website flask db upgrade

	print_website_finish
}

	while getopts "e:cqdh" opt; do
  case $opt in
    e)
      ENV=$OPTARG
      ;;
    c)
      CLEAN=1
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

if [ "$CLEAN" = 1 ]; then
    echo -e "\033[31mDoing cleanup... \033[0m"
    echo
    if [ "$DRY" = 0 ]; then
        docker kill $(docker ps -aq) >/dev/null 2>&1 || true
        docker system prune --all --volumes
    fi
    echo
fi

if [ "$ENV" = "origin" ]; then
 	install_origin_environment
elif [ "$ENV" = "origin-website" ]; then
	install_website_environment
else
	usage
fi
