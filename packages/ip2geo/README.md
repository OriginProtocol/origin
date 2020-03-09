IP to geo util package.

The data directory contains IP to geo data files from Maxmind.
Those files should get updated on a regular basis to keep them up to date.
Here are the steps to follow:
 - cd to origin/nodes_modules/geoip-lite
 - npm run-script updatedb license_key=<MaxMind licence key>
 - cp data/* ../../packages/ip2geo/data/
 - cd ../../packages/ip2geo/data/
 - git commit
