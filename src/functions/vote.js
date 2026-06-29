const { app } = require('@azure/functions');
const { TableClient, odata } = require('@azure/data-tables');

app.http('vote', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        const connectionString = process.env.AzureWebJobsStorage;
        const eventId = 'karaoke2026';

        const votesClient = TableClient.fromConnectionString(connectionString, 'Votes');
        const performancesClient = TableClient.fromConnectionString(connectionString, 'Performances');

        const body = await request.json();

        const participantId = body.participantId;
        const performanceId = body.performanceId;

        if (!participantId || !performanceId) {
            return {
                status: 400,
                jsonBody: {
                    message: 'participantId and performanceId are required'
                }
            };
        }

        const voteRowKey = `${participantId}_${performanceId}`;
        const now = new Date().toISOString();

        const voteEntity = {
            partitionKey: eventId,
            rowKey: voteRowKey,
            participantId: participantId,
            performanceId: performanceId,
            voteTime: now
        };

        try {
            await votesClient.createEntity(voteEntity);
        } catch (error) {
            if (error.statusCode === 409) {
                return {
                    status: 409,
                    jsonBody: {
                        message: 'already voted for this performance'
                    }
                };
            }

            throw error;
        }

        const performance = await performancesClient.getEntity(eventId, performanceId);
        const currentVoteCount = Number(performance.voteCount || 0);

        performance.voteCount = currentVoteCount + 1;

        await performancesClient.updateEntity(performance, 'Merge');

        return {
            jsonBody: {
                message: 'voted',
                participantId: participantId,
                performanceId: performanceId,
                voteCount: performance.voteCount,
                voteTime: now
            }
        };
    }
});