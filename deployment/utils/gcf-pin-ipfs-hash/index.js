const IpfsClusterAPI = require('./ipfs-cluster-api-service.js');
const ipfsClusterApiService = new IpfsClusterAPI(
  process.env.IPFS_CLUSTER_URL,
  process.env.IPFS_CLUSTER_USERNAME,
  process.env.IPFS_CLUSTER_PASSWORD
);

exports.pinService = async (event) => {
  const pubsubMessage = event.data;
  const listingData = pubsubMessage
    ? JSON.parse(Buffer.from(pubsubMessage, 'base64').toString())
    : null;

  let pinnedHashes = [];
  let unPinnedHashes = [];

  if (!Object.is(listingData, null)) {
    if("media" in listingData && listingData["media"].length > 0) {
      // retreive and parse ipfs hash from listing json and then pin it
      mediaData = listingData["media"];
      for(var i = 0; i < mediaData.length; i++){
        media = mediaData[i];
        hashToPin = media["url"].replace('ipfs://','');
        pinned = await ipfsClusterApiService.pin(hashToPin);
        pinned ? pinnedHashes.push(hashToPin) : unPinnedHashes.push(hashToPin);
      }
    } else {
      console.log("No media ipfs hashes found")
    }
  } else {
    console.log("Error retreiving listing data")
  }

  console.log("Pinned following hashes: ", pinnedHashes.join(", "), "\n");
  console.log("Could not pin following hashes: ", unPinnedHashes.join(", "), "\n");
};
