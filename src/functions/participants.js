const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');

app.http('participants', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const connectionString = process.env.AzureWebJobsStorage;
        const tableName = 'Participants';
        const eventId = 'karaoke2026';

        const client = TableClient.fromConnectionString(connectionString, tableName);

        const participants = [];

        for await (const entity of client.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${eventId}'`
            }
        })) {
            participants.push({
                participantId: entity.rowKey,
                joinTime: entity.joinTime,
                status: entity.status
            });
        }

        return {
            jsonBody: {
                count: participants.length,
                participants: participants
            }
        };
    }
});