# origin-box: bridge

## Usage

- Activate the environment:

  `$ source /opt/origin-bridge/origin-bridge-venv/bin/activate`

## Configuration
- bridge server envionment variable file is located at `/opt/origin-bridge/.env` within the container
- database url: postgresql://docker:docker@localhost:5432/origin-bridge

## Tests

Run these commands *inside the container*:
- `cd /opt/origin-bridge/scripts/`
- `./run-tests.sh`

## TODOS
- envkey integration
- templating / user configurability / live updating of configs
- SDK, integration testing
