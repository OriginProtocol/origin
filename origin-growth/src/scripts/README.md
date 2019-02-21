Steps to test the pipeline:
 - node ./src/util/fixtures
 - node ./src/scripts/verifyEvents.js --persist
 - node ./src/scripts/updateCampaigns.js --persist
 - node ./src/scripts/calculateRewards.js --persist
 - node ./src/scripts/distributeRewards.js --networkId=999 --persist
