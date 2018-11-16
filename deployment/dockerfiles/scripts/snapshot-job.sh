#!/bin/bash

# This script is used by the auto-gke-pvc-snapshots container to take snapshots
# of all the attached Google PVC disks.

if [ -z "${DAYS_RETENTION}" ]; then
  # Default to 14 days
  DAYS_RETENTION=14
fi

gcloud compute disks list --filter='description:* AND description~kubernetes.io/created-for/pvc/name' --format='value(name,zone)' | while read -r DISK_NAME ZONE; do
  gcloud compute disks snapshot "${DISK_NAME}" --snapshot-names autogcs-"${DISK_NAME:0:31}"-"$(date '+%Y-%m-%d-%s')" --zone "${ZONE}"
  echo "Snapshot created"
done

from_date=$(date -d "-${DAYS_RETENTION} days" "+%Y-%m-%d")
gcloud compute snapshots list --filter="creationTimestamp<${from_date} AND name~'autogcs.*'" --uri | while read -r SNAPSHOT_URI; do
   gcloud compute snapshots delete "${SNAPSHOT_URI}" --quiet
done
