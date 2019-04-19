# POST a sample event to event listener
# Usage:
# $ ./test_post.sh OfferAccepted.js

curl -XPOST \
     -H 'Content-Type:application/json' \
     -H 'Accept: application/json' \
     --data-binary @$1 \
     http://localhost:3456/events \
     -v \
     -s
