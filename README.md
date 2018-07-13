![origin_github_banner](https://user-images.githubusercontent.com/673455/37314301-f8db9a90-2618-11e8-8fee-b44f38febf38.png)

Head to https://www.originprotocol.com/developers to learn more about what we're building and how to get involved.

# Origin Box

Origin Box is a [Docker](https://www.docker.com/) container setup for running all core Origin components together in a single environment, preconfigured to work together.

Origin Box currently supports the following components:
- [origin-dapp](https://github.com/OriginProtocol/origin-dapp)
- [origin-js](https://github.com/OriginProtocol/origin-js)
- [origin-bridge](https://github.com/originprotocol/origin-bridge)

Each repo is symlinked from the container to a local directory. You may edit the source code using your favorite editor. The repo directories just normal git repositories, so you can treat them as you would any other git repository. You can make changes, commit them, and change branches—and the container will be automatically kept in sync.

However, non-git related actions should be performed from within the container. For example, running any sort of npm command (e.g. `npm test`) should be done from within the container cli. The same applies for python commands.


## Use Cases

Origin Box has several intended use cases:
- Demonstration: We want to make it as easy as possible for people to spin up their own Origin environment, emphasizing that this platform is truly open and decentralized.
- Development: While we do our best to keep our components as independent as possible, ultimately they are all designed to function together as one unit. For development we do try to stub external components as much as possible, but this has its practical limits. It is often beneficial to be able to do development in an environment where all of the components are running. It can be tricky to get all of the various components synchronized on your local machine. Origin Box manages this complexity.
- End-to-end Testing: Currently we do not have any automated end-to-end tests. We rely heavily on manual testing. Having one environment where all of our components are running together will hopefully make it easier for us to set up end-to-end testing when we are ready to do that.


## System Requirements

- Docker **version 18 or greater**:
`docker --version`
- Git:
`git --version`
- Unix-based system (OSX or Linux) needed to run the bash scripts

## Getting started

1. Clone this repo:
```
git clone git@github.com:OriginProtocol/origin-box.git && cd origin-box
```

2. Run the setup script:
```
./scripts/setup.sh
```

This will clone the latest `develop` branches of `origin-js`, `origin-dapp`, and `origin-bridge` in the `origin-box` directory.

**Note:** Currently these are cloned with custom directory names of `js`, `dapp`, and `bridge`.

If desired, you may `cd` into these directores and checkout different branches.

3. From a different tab, run the start script:
```
./scripts/start.sh
```

This will take a few minutes to run. You can tell all components are running when you see a steady stream of lines sayins `beat: Waking up in 9.99 seconds.`.

You can then access the Demo DApp, local blockchain, and Bridge Server in the usual way on the usual ports, from your host machine. For example, the Demo Dapp will be at http://localhost:3000/#/, and a sample IPFS listing can be loaded from http://localhost:8080/ipfs/QmTfozaMrUBZdYBzPgxuSC15zBRgLCEfQmWFZwmDHYGY1e

4. Access the CLI:

    ./scripts/cli.sh

### Repo-specific instructions:

- [origin-bridge](origin-bridge.md)

### pm2

Currently we're using [pm2](http://pm2.keymetrics.io/) to automatically start and manage core processes for all of the components. You can run `pm2 list` from within the container cli to see all currently running processes.

## Connectivity tests from localhost

- bridge server: curl http://127.0.0.1:5000
- postgres:  psql -h 127.0.0.1 -p 5432 -d "origin-bridge" -U docker --password <-- currently only working from within the container
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

```
┌────────────────────┬────┬──────┬─────┬────────┬─────────┬────────┬─────┬───────────┬──────┬──────────┐
│ App name           │ id │ mode │ pid │ status │ restart │ uptime │ cpu │ mem       │ user │ watching │
├────────────────────┼────┼──────┼─────┼────────┼─────────┼────────┼─────┼───────────┼──────┼──────────┤
│ bridge             │ 1  │ fork │ 36  │ online │ 0       │ 60s    │ 0%  │ 3.0 MB    │ root │ disabled │
│ celery             │ 2  │ fork │ 42  │ online │ 0       │ 60s    │ 0%  │ 3.1 MB    │ root │ disabled │
│ dapp               │ 6  │ fork │ 51  │ online │ 0       │ 60s    │ 0%  │ 2.8 MB    │ root │ disabled │
│ elasticsearch      │ 4  │ fork │ 48  │ online │ 0       │ 60s    │ 0%  │ 2.8 MB    │ root │ disabled │
│ js                 │ 5  │ fork │ 50  │ online │ 0       │ 60s    │ 0%  │ 2.7 MB    │ root │ disabled │
│ pm2-http-interface │ 7  │ fork │ 83  │ online │ 0       │ 59s    │ 0%  │ 41.0 MB   │ root │ disabled │
│ postgresql         │ 3  │ fork │ 44  │ online │ 0       │ 60s    │ 0%  │ 2.9 MB    │ root │ disabled │
│ redis              │ 0  │ fork │ 32  │ online │ 0       │ 60s    │ 0%  │ 4.3 MB    │ root │ disabled │
└────────────────────┴────┴──────┴─────┴────────┴─────────┴────────┴─────┴───────────┴──────┴──────────┘
```


## Troubleshooting

### "port is already allocated"
```
Error starting userland proxy: Bind for 0.0.0.0:5000 failed: port is already allocated
```
This indicates that you have a process using a port needed by origin-box. This often happens if you are running origin-website, or running the origin-dapp outside the box. Use `ps` or Activity Monitor to search for `node`, `python`, or any process that might be using ports 5000, 5002, 6379, 8080, 9200, 5432, 4000, 4002, and kill the process.
