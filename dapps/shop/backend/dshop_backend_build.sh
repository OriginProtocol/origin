#!/bin/bash
################################################################################
## Usage:
##  ENVKEY="myEnvkey" dshop_backend_build.sh <tag>
################################################################################

PWD="$(pwd)"
DIR="$(realpath "$(dirname "${BASH_SOURCE[0]}")")"
PROJECT_ROOT="$(realpath $DIR/../../../)"
DSHOP_VALUES_DIR="$PROJECT_ROOT/devops/kubernetes/values/origin-experimental"
DSOP_SECRETS_LOC="$DSHOP_VALUES_DIR/secrets-dshop.yaml"
PROJECT_ID="origin-214503"
DOCKERFILES_DIR="$PROJECT_ROOT/devops/dockerfiles"
NAME="dshop-backend"
DOCKERFILE="$NAME"
NAMESPACE="experimental"
TAG=$(date +'%Y%m%d%H%M%s')

if [[ -z "$ENVKEY" ]]; then
  echo "ENVKEY must be defined"
  exit 1
fi

cd $PROJECT_ROOT

# Don't do helm ops with this right now
# test -f "$DSOP_SECRETS_LOC"
# if [[ $? -ne "0" ]]; then
#   echo "decrypt secrets at $DSHOP_VALUES_DIR/secrets.enc"
#   exit 1
# fi

# Use arg as tag if given
if [[ -n "$1" ]]; then
  TAG="$1"
fi

docker build \
    -f "$DOCKERFILES_DIR/$DOCKERFILE" \
    -t "gcr.io/$PROJECT_ID/$NAMESPACE/$NAME:$TAG" \
    --build-arg ENVKEY="$ENVKEY" \
    . && \
gcloud auth configure-docker && \
docker push "gcr.io/$PROJECT_ID/$NAMESPACE/$NAME:$TAG" && \
gcloud container images add-tag \
    "gcr.io/$PROJECT_ID/$NAMESPACE/$NAME:$TAG" \
    "gcr.io/$PROJECT_ID/$NAMESPACE/$NAME:latest" \
    --quiet

if [[ $? -ne "0" ]]; then
  echo "Build failed"
  exit 1
fi

cd $PWD
