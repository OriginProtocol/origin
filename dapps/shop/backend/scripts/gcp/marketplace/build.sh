#!/bin/bash
################################################################################
##
## This script will use Packer to build a VM, then create an iamge of said VM 
## for later use in the marketplace.
##
## It builds using the dedicated dshop repo at:
##   https://github.com/OriginProtocol/dshop
##
## startup_script.sh is executed on VM launch to do the system build.
##
## The final image will be named origin-dshop-YYYYMMDDHHmmSS
##
## Requirements: gcloud, packer
##
################################################################################

echo "Writing packer.json..."

BUILD_ID=$(date +%Y%m%d%H%M%S)
SOURCE_IMAGE="debian-10-buster-v20200413"
IMAGE_FAMILY="origin-dshop"
IMAGE_NAME="$IMAGE_FAMILY-$BUILD_ID"
PACKER_ZONE="us-west2-b"
PACKER_USERNAME="packer"
TMP_DIR="/tmp/dshop-build-$BUILD_ID"

mkdir -p $TMP_DIR

########################
# Get the GCP project ID
########################

PROJECT_ID="$GCP_PROJECT_ID"

if [[ -z "$PROJECT_ID" ]]; then
    PROJECT_ID=$(gcloud projects list | grep -v PROJECT_ID | head -n1 | awk '{ print $1 }')
fi

if [[ -z "$PROJECT_ID" ]]; then
    echo "Unable to determine GCP project automagically. Set GCP_PROJECT_ID"
    exit 1
fi

echo "Project ID: $PROJECT_ID"

######################
# Create packer config
######################

PACKER_JSON="$TMP_DIR/packer.json"

cat > $PACKER_JSON <<EOF
{
  "builders": [
    {
      "type": "googlecompute",
      "project_id": "$PROJECT_ID",
      "source_image": "$SOURCE_IMAGE",
      "ssh_username": "$PACKER_USERNAME",
      "image_name": "$IMAGE_NAME",
      "image_family": "$IMAGE_FAMILY",
      "zone": "$PACKER_ZONE",
      "startup_script_file":"startup_script.sh"
    }
  ]
}
EOF

echo "Created $PACKER_JSON"

##################
# Run packer build
##################

echo "Running packer build..."

packer build $PACKER_JSON

echo "Packer image build complete. Image name: $IMAGE_NAME"
