# logformatter

Utility script for formatting JSON logs from stackdriver.

## Install

Since this isn't packaged and distributed to npm, try the following:

    npm pack && npm install -g logformatter-0.1.0.tgz

## Example Usage

### Format logs from a file

    cat ~/Downloads/null__logs__2019-05-23T09-42.json | formatlogs

### Format logs from gcloud utility

  gcloud beta logging read '[myfilters]' | formatlogs
