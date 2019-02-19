Uses node v8 (gcloud beta).
Set ipfs cluster url and basic auth username and password in `ipfs_vars.yaml` file.
A test `publisher.js` file is included which publishes the data in `listing-data.json` file to the topic "test-topic"

Following command sets up the google cloud function to pin ipfs hashes which is triggered by the "test-topic" topic.

`gcloud beta functions deploy pinService --runtime nodejs8 --env-vars-file ipfs_vars.yaml --trigger-topic test-topic`
