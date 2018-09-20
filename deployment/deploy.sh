#!/bin/bash

set -e

set -o pipefail

GCLOUD_REGISTRY=gcr.io
GCLOUD_PROJECT=origin-214503

function usage() {
  echo "Manage Origin Protocol "
  echo
  echo "Usage:"
  echo "  $0 -n namespace [-c container] [-h]"
  echo
  echo "Options:"
  echo -e "  -n \t Namespace to update the Helm release for."
  echo -e "  -c \t Container to build and deploy. Optional."
  echo -e "  -h \t Show this help."
  echo
}

function build_and_push_container() {
  DOCKERFILE=dockerfiles/${NAMESPACE}/${CONTAINER}

  if [ ! -e "$DOCKERFILE" ]; then
    echo -e "\033[31mDockerfile not found at ./${DOCKERFILE} \033[0m"
    exit 1
  fi

  DEPLOYED_TAG=`cat ${VALUES_PATH}/${VALUES_FILE} | grep ${IMAGE_TAG_FIELD} | cut -d " " -f 2 | tr -d "'"`

  echo -e "Deployed container tag is \033[94m${DEPLOYED_TAG}\033[0m"

  # Get short git hash from remote repo
  GIT_HASH=$(git ls-remote git@github.com:OriginProtocol/$REPO.git HEAD | cut -c1-7)
  DEPLOY_TAG=${GIT_HASH}

  if [ "$DEPLOYED_TAG" == "$GIT_HASH" ]; then
    echo -e "\033[31mDeployed container tag is the same as new deploy tag, appending unix timestamp to tag to force Kubernetes to update deployment\033[0m"
    DEPLOY_TAG=${DEPLOY_TAG}-`date +%s`
  fi

  echo -ne "This will build and deploy a container for \033[94m${CONTAINER}@${GIT_HASH}\033[0m, proceed (y/n)? "
  read answer

  if [ "$answer" != "${answer#[Nn]}" ] ;then
    exit
  fi

  echo -e "Building container for \033[94m${CONTAINER}... \033[0m"

  docker build ../ \
    -f dockerfiles/${NAMESPACE}/${CONTAINER} \
    -t ${GCLOUD_REGISTRY}/${GCLOUD_PROJECT}/${NAMESPACE}/${CONTAINER}:${DEPLOY_TAG} \
    -t ${GCLOUD_REGISTRY}/${GCLOUD_PROJECT}/${NAMESPACE}/${CONTAINER}:latest \

  echo -e "Pushing container to \033[94m${GCLOUD_REGISTRY}... \033[0m"
  docker push ${GCLOUD_REGISTRY}/${GCLOUD_PROJECT}/${NAMESPACE}/${CONTAINER}:${DEPLOY_TAG}
}

function check_secrets() {
  VALUES_PATH=kubernetes/values
  VALUES_FILE=values-${NAMESPACE}.yaml
  SECRETS_FILE=secrets-${NAMESPACE}.yaml
  SECRETS_FILE_ENC=secrets-${NAMESPACE}.enc.yaml

  if [ ! -e "${VALUES_PATH}/${SECRETS_FILE}" ]; then
    echo -e "\033[31mCould not find ${SECRETS_FILE} at ${VALUES_PATH} \033[0m"
  else
    return 0
  fi

  if [ -e "${VALUES_PATH}/secrets-${NAMESPACE}.enc.yaml" ]; then
    echo -ne "Found encrypted secrets, attempt to decrypt using sops (y/n)? "
    read answer
    if [ "$answer" != "${answer#[Nn]}" ] ;then
      exit
    else
      out=$(sops --decrypt ${VALUES_PATH}/${SECRETS_FILE_ENC}) && [[ -n "$out" ]] && echo "$out" > ${VALUES_PATH}/${SECRETS_FILE}
    fi
  fi
}

function update_values() {
  echo -e 'Updating chart values with new tag for container'
  sed -i.old "s|^${IMAGE_TAG_FIELD}: .*|${IMAGE_TAG_FIELD}: '${GIT_HASH}'|g" ${VALUES_PATH}/${VALUES_FILE} && rm ${VALUES_PATH}/${VALUES_FILE}.old
  echo -e "\033[31mUpdated values file at ${VALUES_PATH}/${VALUES_FILE}, this should be committed!\033[0m"
}

function update_helm_release() {
  echo 'Updating Helm release'
  helm upgrade ${NAMESPACE} \
    kubernetes/charts/origin \
    -f kubernetes/charts/origin/values.yaml \
    -f ${VALUES_PATH}/${VALUES_FILE} \
    -f ${VALUES_PATH}/${SECRETS_FILE}
}

while getopts ":c:n:h" opt; do
  case $opt in
    c)
      CONTAINER=$OPTARG
      case "$CONTAINER" in
        origin-dapp)
	  IMAGE_TAG_FIELD=dappImageTag
	  REPO=origin-dapp
	  ;;
        origin-bridge)
	  IMAGE_TAG_FIELD=bridgeImageTag
	  REPO=origin-bridge
	  ;;
        origin-messaging)
	  IMAGE_TAG_FIELD=messagingImageTag
	  REPO=origin-box
	  ;;
	origin-faucet)
	  IMAGE_TAG_FIELD=faucetImageTag
	  REPO=origin-js
	  ;;
	origin-discovery)
	  IMAGE_TAG_FIELD=discoveryImageTag
	  REPO=origin-js
	  ;;
	event-listener)
	  IMAGE_TAG_FIELD=eventlistenerImageTag
	  REPO=origin-js
	  ;;
	*)
	  echo -e "\033[31mContainer not yet implemented\033[0m"
	  exit 1
      esac
      ;;
    n)
      NAMESPACE=$OPTARG
      case "$NAMESPACE" in
        dev)
          BRANCH=master
	  ;;
        staging)
          BRANCH=staging
	  ;;
        prod)
          BRANCH=stable
	  ;;
	*)
	  echo -e "\033[31mInvalid namespace\033[0m"
	  exit 1
     esac
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

if [ ! "$NAMESPACE" ]; then
  usage
  exit 1
fi

check_secrets

if [ "$CONTAINER" ]; then
  build_and_push_container
  update_values
fi

update_helm_release
