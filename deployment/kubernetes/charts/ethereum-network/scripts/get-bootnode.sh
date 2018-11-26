apk add --no-cache curl;

CNT=0;

echo "Retrieving bootnodes from $BOOTNODE_SERVICE"

while [ $CNT -le 90 ]
do
  curl -m 5 -s $BOOTNODE_SERVICE | xargs echo -n > /geth/bootnodes;

  if [ -s /geth/bootnodes ]
  then
    cat /geth/bootnodes;
    exit 0;
  fi;

  echo "No bootnodes found. retrying $CNT...";
  sleep 2 || break;
  CNT=$((CNT+1));
done;

echo "WARNING: Unable to find bootnodes.";

exit 0;
