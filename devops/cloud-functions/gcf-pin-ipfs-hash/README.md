
# Running unit test
    yarn install
    yarn run test

# Testing with GCP
 - Set ipfs cluster url and basic auth username and password in `ipfs_vars.yaml` file.
 - A test `publisher.js` file is included which publishes the data in `listing-data.json` file to the topic "test-topic"
 - The following command deploys a pinner for testing triggered by the "test-topic" topic.

    `gcloud beta functions deploy pinServiceTest --runtime nodejs8 --env-vars-file ipfs_vars.yaml --trigger-topic test-topic`

# Deployment to production
 - Update ipfs_vars.yaml
 - Deploy the code to GCF:

     `gcloud beta functions deploy pinService --runtime nodejs8 --env-vars-file ipfs_vars.yaml --trigger-topic event-listener`

 - Check logs via GCP console at https://console.cloud.google.com/functions/list?project=origin-214503