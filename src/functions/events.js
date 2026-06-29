const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');

app.http('events', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const connectionString = process.env.AzureWebJobsStorage;
        const tableName = 'Events';
        const eventId = 'karaoke2026';

        const client = TableClient.fromConnectionString(connectionString, tableName);

        if (request.method === 'POST') {
            const body = await request.json();
            const now = new Date().toISOString();

            const entity = {
                partitionKey: eventId,
                rowKey: 'state',
                eventId: eventId,

                mode: body.mode || 'waiting',
                currentPerformanceId: body.currentPerformanceId || '',
                currentSinger: body.currentSinger || '',
                currentSong: body.currentSong || '',
                currentOrder: Number(body.currentOrder || 0),
                votingOpen: Boolean(body.votingOpen || false),

                updatedAt: now
            };

            await client.upsertEntity(entity, 'Merge');

            return {
                jsonBody: {
                    message: 'event state updated',
                    entity
                }
            };
        }

        try {
            const entity = await client.getEntity(eventId, 'state');

            return {
                jsonBody: {
                    exists: true,
                    event: entity
                }
            };
        } catch (error) {
            if (error.statusCode === 404) {
                return {
                    jsonBody: {
                        exists: false,
                        event: null
                    }
                };
            }

            throw error;
        }
    }
});