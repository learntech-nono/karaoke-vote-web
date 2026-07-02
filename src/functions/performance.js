const { app } = require('@azure/functions');
const { TableClient } = require('@azure/data-tables');
const crypto = require('crypto');

app.http('performance', {
    methods: ['POST', 'GET', 'PUT', 'DELETE'],
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
                originSinger: body.originSinger || '',
                key: body.key || '',
                choiceRank: Number(body.choiceRank || 1),
                order: Number(body.order || 0),

                audienceCount: Number(body.audienceCount || 0),
                voteCount: 0,
                correctionFactor: 1,
                createdAt: now
            };

            await client.createEntity(entity);

            return {
                jsonBody: {
                    message: 'performance created',
                    performanceId,
                    entity
                }
            };
        }

        if (request.method === 'PUT') {
            const body = await request.json();
            const performanceId = body.performanceId;

            if (!performanceId) {
                return {
                    status: 400,
                    jsonBody: { message: 'performanceId is required' }
                };
            }

            const entity = {
                partitionKey: eventId,
                rowKey: performanceId,
                singer: body.singer || '',
                song: body.song || '',
                originSinger: body.originSinger || '',
                key: body.key || '',
                choiceRank: Number(body.choiceRank || 1),
                order: Number(body.order || 0)
            };

            await client.updateEntity(entity, 'Merge');

            return {
                jsonBody: {
                    message: 'performance updated',
                    performanceId
                }
            };
        }

        if (request.method === 'DELETE') {
            const performanceId = request.query.get('performanceId');

            if (!performanceId) {
                return {
                    status: 400,
                    jsonBody: { message: 'performanceId is required' }
                };
            }

            await client.deleteEntity(eventId, performanceId);

            return {
                jsonBody: {
                    message: 'performance deleted',
                    performanceId
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
                originSinger: entity.originSinger || '',
                key: entity.key || '',
                choiceRank: Number(entity.choiceRank || 1),
                order: Number(entity.order || 0),
                audienceCount: Number(entity.audienceCount || 0),
                voteCount: Number(entity.voteCount || 0),
                correctionFactor: Number(entity.correctionFactor || 1),
                createdAt: entity.createdAt
            });
        }

        performances.sort((a, b) => a.order - b.order);

        return {
            jsonBody: {
                count: performances.length,
                performances
            }
        };
    }
});