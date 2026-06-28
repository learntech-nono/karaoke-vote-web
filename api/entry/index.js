const { CosmosClient } = require("@azure/cosmos");

module.exports = async function (context, req) {
  const connectionString = process.env.COSMOS_CONNECTION_STRING;
  const client = new CosmosClient(connectionString);

  const database = client.database("karaoke-db");
  const container = database.container("entries");

  if (req.method === "POST") {
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
      body: { message: "登録成功", item }
    };
  } else {
    context.res = {
      status: 405,
      body: { message: "Method Not Allowed" }
    };
  }
};

