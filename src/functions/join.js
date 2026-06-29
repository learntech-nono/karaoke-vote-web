const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');
const crypto = require('crypto');

app.http('join', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const connectionString = process.env.AzureWebJobsStorage;
        const tableName = 'Participants';
        const eventId = 'karaoke2026';

        const client = TableClient.fromConnectionString(connectionString, tableName);

        const participantId = crypto.randomUUID();
        const now = new Date().toISOString();

        const entity = {
            partitionKey: eventId,
            rowKey: participantId,
            joinTime: now,
            status: 'joined'
        };

        await client.createEntity(entity);

        return {
            jsonBody: {
                message: 'joined',
                participantId: participantId,
                joinTime: now
            }
        };
    }
});