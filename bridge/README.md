This docker image installs and runs the bridge server (along with postgres, redis) on Ubuntu 16.04, managing the processes using pm2. To run:

1. Make sure you have Docker **version 18 or greater**:
`docker --version`

1. Build the docker image:
`npm run bridge:build`

3. Run the image with port mappings: `npm run bridge:start`

4. Access the CLI:
`npm run bridge:bash`

5. Stop and remove the container: `npm run bridge:stop`.


**Configuration**
- bridge server envionment variable file is located at `/opt/bridge-server/.env` within the container
- database url: postgresql://docker:docker@localhost:5432/bridge-server
- if running the demo-dapp locally alongside the container, use these settings for the environment variable (.env) file:
    - `BRIDGE_SERVER_PROTOCOL=http`
    - `BRIDGE_SERVER_DOMAIN=localhost:5000`
    - `IPFS_API_PORT=5002`
    - `IPFS_DOMAIN=localhost`
    - `IPFS_GATEWAY_PORT=8080`
    - `IPFS_GATEWAY_PROTOCOL=http`
    - `PROVIDER_URL=http://localhost:8545`

**Connectivity tests from localhost**
- bridge server: curl http://127.0.0.1:5000
- postgres:  psql -h 127.0.0.1 -p 5432 -d "bridge-server" -U docker --password <-- currently only working from within the container
- redis: redis-cli <-- defaults to connecting to 127.0.0.1:6379
- elasticsearch: curl http://127.0.0.1:9200
- pm2 API (has stats for running applications): curl http://127.0.0.1:4000

**\# netstat -nlt** (truncated)

|Proto  | Recv-Q |Send-Q |Local Address     |      Foreign Address      |   State      |
| ----- | ------ | ----- | ---------------- | ------------------------- | ------------ |
|tcp    |    0   |   0   | 127.0.0.1:5000   |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:5002     |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:6379     |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:8080     |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:9200     |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:5432     |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:4000     |       0.0.0.0:*           |    LISTEN    |
|tcp    |    0   |   0   | 0.0.0.0:4002     |       0.0.0.0:*           |    LISTEN    |

**\# pm2 list**

| App name           | id | mode | pid  | status | restart | uptime | cpu | mem        | user | watching |
| ------------------ | -- | ----- | ---- | ------ | ------- | ------ | ---- | ---------- | ---- | -------- |
| bridge server      | 3  | fork | x    | online | 0       | XXm    | 0%  | 1.8 MB    | root | disabled |
| celery             | 4  | fork | x    | online | 1       | XXm    | 0%  | 1.6 MB    | root | disabled |
|
| elasticsearch      | 7  | fork | x    | online | 0       | XXs    | 0%  | 1.6 MB     | root | disabled |
| origin-js          | 1  | fork | x    | online | 0       | XXm    | 0%  | 30.5 MB    | root | disabled |
| pm2-http-interface | 6  | fork | x    | online | 0       | XXm    | 0%  | 29.0 MB    | root | disabled |
| postgresql         | 6  | fork | x    | online | 0       | XXh    | 0%  | 1.5 MB     | root | disabled |
| redis              | 0  | fork | x    | online | 0       | XXm    | 0%  | 3.2 MB     | root | disabled |


**TODOS:**
- envkey integration
- templating / user configurability / live updating of configs
- SDK, integration testing
