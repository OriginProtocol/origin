# POST a sample message to event listener
# Usage:
# $ ./test_post_message.sh message.js

curl -XPOST \
     -H 'Content-Type:application/json' \
     -H 'Accept: application/json' \
     --data-binary @$1 \
     http://localhost:3456/messages \
     -v \
     -s
