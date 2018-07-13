# origin-box: js

## Tests

Run these commands *inside the container*:
- `pm2 stop js` (stop the running blockchain, as it interferes with the tests)
- `cd /opt/origin-js/source/` (enter source directory)
- `npm test`
- `pm2 start js` (start up blockchain again if you want to continue development)
