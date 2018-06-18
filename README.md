# Origin Box

Origin Box is a container setup for running multiple Origin components simultaneously in a single environment.

## Use Cases

Origin Box has several intended use cases:
- Demonstration: We want to make it as easy as possible for people to spin up their own Origin environment, emphasizing that this platform is truly open and decentralized.
- Development: While we do our best to keep our components as independent as possible, ultimately they are all designed to function together as one unit. For development we do try to stub external components as much as possible, but this has its practical limits. It is often beneficial to be able to do development in an environment where all of the components are running. It can be tricky to get all of the various components synchronized on your local machine. Origin Box manages this complexity.
- End-to-end Testing: Currently we do not have any automated end-to-end tests. We rely heavily on manual testing. Having one environment where all of our components are running together will hopefully make it easier for us to set up end-to-end testing when we are ready to do that.

## Supported Components

Origin Box currently supports the following components:
- [Dapp](https://github.com/OriginProtocol/demo-dapp)
- [JS](https://github.com/OriginProtocol/origin-js)
- [Bridge](https://github.com/OriginProtocol/bridge-server)

## System Requirements

- Docker **version 18 or greater**:
`docker --version`
- Git:
`git --version`
- Unix-based system (OSX or Linux) needed to run the bash scripts

## Usage

1. Run the setup script (from origin-box root directory):
`./scripts/setup.sh`

1. Run the start script: `./scripts/start.sh`

1. Access the CLI:
`./scripts/cli.sh`

You may now edit the source code using your favorite editor in the ignored directories (currently `dapp`, `js`, and `bridge`). These are just normal git repositories that get cloned as part of the `scripts/setup.sh` script, so you can treat them as you would any other git repository. You can make changes, commit them, and change branches - and the container will be automatically kept in sync.

However, non-git related actions should be performed from within the container. For example, running any sort of npm command (e.g. `npm test`) should be done from within the container cli. The same applies for python commands.

### Repo-specific instructions:

- [bridge-server](bridge.md)

### pm2

Currently we're using [pm2](http://pm2.keymetrics.io/) to automatically start and manage core processes for all of the components. You can run `pm2 list` from within the container cli to see all currently running processes.

## Connectivity tests from localhost
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
