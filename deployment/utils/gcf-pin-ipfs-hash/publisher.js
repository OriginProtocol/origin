(async () => {
  // Imports the Google Cloud client library
  const { PubSub } = require("@google-cloud/pubsub");

  // Creates a client
  const pubsub = new PubSub();

  const topicName = "test-topic";

  //for testing purposes, retreive json from file.
  const listing_data = require("./listing-data.json");
  const data = JSON.stringify({
    type: "listing",
    ipfsHash: "hash",
    rawData: listing_data
  });

  // Publishes the message as a string, e.g. "Hello, world!" or JSON.stringify(someObject)
  const dataBuffer = Buffer.from(data);

  const messageId = await pubsub
    .topic(topicName)
    .publisher()
    .publish(dataBuffer);
  console.log(`Message ${messageId} published.`);
})();
