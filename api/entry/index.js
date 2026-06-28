const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env.COSMOS_CONNECTION_STRING.split(";")[0].split("=")[1];
const key = process.env.COSMOS_CONNECTION_STRING.split(";")[1].split("=")[1];
const client = new CosmosClient({ endpoint, key });

module.exports = async function (context, req) {
  const database = client.database("karaoke-db");
  const container = database.container("entries");

  const item = {
    id: Date.now().toString(),
    name: req.body.name,
    song: req.body.song,
    artist: req.body.artist,
    key: req.body.key,
    createdAt: new Date().toISOString()
  };

  await container.items.create(item);
  context.res = {
    status: 200,
    body: { message: "Entry saved successfully!", item }
  };
};

