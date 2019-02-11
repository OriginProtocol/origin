Steps to test the pipeline:
 - node ./src/util/fixtures
 - node ./src/scripts/verifyEvents.js --doIt
 - node ./src/scripts/updateCampaigns.js --doIt
 - node ./src/scripts/calculateRewards.js --doIt
 - node ./src/scripts/distributeRewards.js --doIt
