const IpfsClusterAPI = require('./ipfs-cluster-api-service.js');
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

exports.pinService = async (event) => {
  const pubsubMessage = event.data;
  const data = pubsubMessage
    ? JSON.parse(Buffer.from(pubsubMessage, 'base64').toString())
    : null;

  let pinnedHashes = [];
  let unPinnedHashes = [];

  if (!Object.is(data, null)) {
    const hashesToPin = parseIncomingData(data);
    for(let i = 0; i < hashesToPin.length; i++){
      hashToPin = hashesToPin[i];
      pinned = await ipfsClusterApiService.pin(hashToPin);
      pinned ? pinnedHashes.push(hashToPin) : unPinnedHashes.push(hashToPin);
    }
  } else {
    console.log("Error retreiving listing data");
  }
  console.log("Pinned following hashes: ", pinnedHashes.join(", "), "\n");
  console.log("Could not pin following hashes: ", unPinnedHashes.join(", "), "\n");
};

const parseIncomingData = data => {
  let hashesToPin = [];
  if(data.type === "listing"){
    hashesToPin.push(data.ipfsHash);
    if("media" in data.rawData && data.rawData["media"].length > 0) {
      const mediaData = data.rawData["media"];
      for(let i = 0; i < mediaData.length; i++){
        hashesToPin.push(mediaData[i]["url"].replace('ipfs://',''));
      }
    } else {
      console.log("No media ipfs hashes found in listing data");
    }
  }
  return hashesToPin;
}
