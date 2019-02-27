const IpfsClusterAPI = require("./ipfs-cluster-api-service.js");
const ipfsClusterApiService = new IpfsClusterAPI(
  process.env.IPFS_CLUSTER_URL,
  process.env.IPFS_CLUSTER_USERNAME,
  process.env.IPFS_CLUSTER_PASSWORD
);

/*
Example of incoming data:
{
  type: "listing",
  ipfsHash: "hash",
  rawData: {
    "title": "",
    ...
  }
}
*/

exports.pinService = async event => {
  const pubsubMessage = event.data;
  const data = pubsubMessage
    ? JSON.parse(Buffer.from(pubsubMessage, "base64").toString())
    : null;

  let pinnedHashes = [];
  let unPinnedHashes = [];

  if (!Object.is(data, null)) {
    const hashesToPin = parseIncomingData(data);
    for (let i = 0; i < hashesToPin.length; i++) {
      hashToPin = hashesToPin[i];

      pinned = await ipfsClusterApiService.pin(hashToPin);

      if (pinned) {
        pinnedHashes.push(hashToPin);
      } else {
        // Retry pinning 5 times with 500ms as initial interval and double the interval every try. Set fields accordingly.
        let numberOfRetries = 4;
        let initialRetryInterval = 500;
        let retryIntervalGrowthRate = 2;
        let retryPinned = await promiseSetTimeout(
          hashToPin,
          initialRetryInterval
        );
        while (!retryPinned && numberOfRetries > 0) {
          console.log("Retrying Pinning:\n");
          console.log("Retry Interval : " + initialRetryInterval + "ms \n");
          console.log("Number of Retry : " + (5 - numberOfRetries) + "\n");
          numberOfRetries--;
          initialRetryInterval *= retryIntervalGrowthRate;
          retryPinned = await promiseSetTimeout(
            hashToPin,
            initialRetryInterval
          );
        }
        retryPinned
          ? pinnedHashes.push(hashToPin)
          : unPinnedHashes.push(hashToPin);
      }
    }
  } else {
    console.log("Error retreiving listing data");
  }
  console.log("Pinned following hashes: ", pinnedHashes.join(", "), "\n");
  console.log(
    "Could not pin following hashes: ",
    unPinnedHashes.join(", "),
    "\n"
  );
};

const promiseSetTimeout = async (hashToPin, interval) => {
  return new Promise(resolve => {
    setTimeout(async () => {
      const retryPinned = await ipfsClusterApiService.pin(hashToPin);
      resolve(retryPinned);
    }, interval);
  });
};

const parseIncomingData = data => {
  let hashesToPin = [];
  if (data.type === "listing") {
    hashesToPin.push(data.ipfsHash);
    if ("media" in data.rawData && data.rawData["media"].length > 0) {
      const mediaData = data.rawData["media"];
      for (let i = 0; i < mediaData.length; i++) {
        hashesToPin.push(mediaData[i]["url"].replace("ipfs://", ""));
      }
    } else {
      console.log("No media ipfs hashes found in listing data");
    }
  }
  return hashesToPin;
};
