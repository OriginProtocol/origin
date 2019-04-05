# POST a sample event to event listener
curl -XPOST \
     -H 'Content-Type:application/json' \
     -H 'Accept: application/json' \
     --data-binary @OfferAccepted.json \
     http://localhost:3456/events \
     -v \
     -s

