set -e

repo="$IPFS_PATH"

if [ -e "$repo/config" ]; then
  echo "Found IPFS fs-repo at $repo"
else
  ipfs init
  ipfs config Addresses.API /ip4/0.0.0.0/tcp/5001
  ipfs config Addresses.Gateway /ip4/0.0.0.0/tcp/8080
  # Add websocket to swarm addresses
  ipfs config --json Addresses.Swarm '[
    "/ip4/0.0.0.0/tcp/4001",
    "/ip6/::/tcp/4001",
    "/ip4/0.0.0.0/tcp/9012/ws"
  ]'
fi

ulimit -n 100000

exec ipfs daemon --migrate --enable-pubsub-experiment
