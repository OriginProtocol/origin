#!/bin/bash
################################################################################
## Runs builds only if a specific file/directory has been updated in the latest
## commit.
##
## Usage
## -----
## do_build package-name path/to/file/to/check
################################################################################

echo "Testing builds..."

DIR="$(cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd)"
REPO_COMMIT=$(git rev-parse master)

echo "git version: $(git --version)"

retval=""
fails=0
do_build() {
    CURRENT_BRANCH=$(git branch | grep \* | cut -d ' ' -f2)
    DIFF=$(git diff --name-only $CURRENT_BRANCH..master | grep $2 | wc -l)
    if [[ "$DIFF" != "0" ]]; then
        echo "Building $1..."
        docker build --build-arg ENVKEY=$ENVKEY -t $1 -f $DIR/devops/dockerfiles/$1 .
        RC=$?
        if [[ $RC -eq 0 ]]; then
            retval="[ OK  ] $1"
        else
            retval="[ERROR!] $1"
            fails=$((fails++))
        fi
        echo "$1 build complete."
    else
        retval="[ SKIP ] $1"
    fi
}

results=""

do_build origin-cron infra/cron/package.json
results="$results
$retval"
do_build origin-discovery infra/discovery/package.json
results="$results
$retval"
do_build event-listener infra/discovery/package.json
results="$results
$retval"
do_build origin-graphql packages/graphql/package.json
results="$results
$retval"
do_build origin-growth infra/growth/package.json
results="$results
$retval"
do_build origin-ipfs-proxy packages/ipfs/package.json
results="$results
$retval"
do_build origin-messaging infra/messaging/package.json
results="$results
$retval"
do_build origin-notifications infra/notifications/package.json
results="$results
$retval"
do_build origin-relayer infra/relayer/package.json
results="$results
$retval"
do_build origin-dapp dapps/marketplace/package.json
results="$results
$retval"

echo "Finished build tests:
$results"

exit $fails
