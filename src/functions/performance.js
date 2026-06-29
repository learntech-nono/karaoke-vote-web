const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');
const crypto = require('crypto');

app.http('performance', {
    methods: ['POST', 'GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const connectionString = process.env.AzureWebJobsStorage;
        const tableName = 'Performances';
        const eventId = 'karaoke2026';

        const client = TableClient.fromConnectionString(connectionString, tableName);

        if (request.method === 'POST') {
            const body = await request.json();

            const performanceId = crypto.randomUUID();
            const now = new Date().toISOString();

            const entity = {
                partitionKey: eventId,
                rowKey: performanceId,
                singer: body.singer || '',
                song: body.song || '',
                order: Date.now(),
                audienceCount: Number(body.audienceCount || 0),
                voteCount: 0,
                correctionFactor: 1,
                createdAt: now
            };

            await client.createEntity(entity);

            return {
                jsonBody: {
                    message: 'performance created',
                    performanceId: performanceId,
                    entity: entity
                }
            };
        }

        const performances = [];

        for await (const entity of client.listEntities({
            queryOptions: {
                filter: `PartitionKey eq '${eventId}'`
            }
        })) {
            performances.push({
                performanceId: entity.rowKey,
                singer: entity.singer,
                song: entity.song,
                order: entity.order,
                audienceCount: entity.audienceCount,
                voteCount: entity.voteCount,
                correctionFactor: entity.correctionFactor,
                createdAt: entity.createdAt
            });
        }

        performances.sort((a, b) => a.order - b.order);

        return {
            jsonBody: {
                count: performances.length,
                performances: performances
            }
        };
    }
});