# POST a sample message to event listener
# Usage:
# $ ./test_post_message.sh Message-2recievers.json

curl -XPOST \
     -H 'Content-Type:application/json' \
     -H 'Accept: application/json' \
     --data-binary @$1 \
     http://localhost:3456/messages \
     -v \
     -s
