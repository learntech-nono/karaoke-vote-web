let currentEvent = null;

async function getParticipantId() {
    let participantId = localStorage.getItem("participantId");

    if (!participantId) {
        const data = await apiGet("/join");
        participantId = data.participantId;
        localStorage.setItem("participantId", participantId);
    }

    return participantId;
}

async function loadEventStateForParticipant() {
    const status = document.getElementById("status");
    const data = await apiGet("/events");

    if (!data.exists || !data.event) {
        status.innerHTML = "<p>イベント準備中です。</p>";
        return;
    }

    const event = data.event;
    currentEvent = event;

    if (event.mode === "singing" && event.votingOpen) {
        const votedKey = `voted_${event.currentPerformanceId}`;
        const alreadyVoted = localStorage.getItem(votedKey) === "true";

        status.innerHTML = `
            <h2>現在歌唱中</h2>
            <h1>${event.currentSinger}</h1>
            <h2>♪ ${event.currentSong}</h2>
            <button onclick="voteCurrentPerformance()" ${alreadyVoted ? "disabled" : ""}>
                ${alreadyVoted ? "投票済み" : "投票する"}
            </button>
            <div id="voteMessage"></div>
        `;
        return;
    }

    status.innerHTML = "<p>次の歌唱をお待ちください。</p>";
}

async function voteCurrentPerformance() {
    const message = document.getElementById("voteMessage");

    if (!currentEvent || !currentEvent.currentPerformanceId) {
        message.innerHTML = "現在投票できる曲がありません。";
        return;
    }

    const participantId = await getParticipantId();

    try {
        const data = await apiPost("/vote", {
            participantId: participantId,
            performanceId: currentEvent.currentPerformanceId
        });

        localStorage.setItem(`voted_${currentEvent.currentPerformanceId}`, "true");

        message.innerHTML = "投票しました。ありがとうございます！";
        await loadEventStateForParticipant();

    } catch (err) {
        message.innerHTML = "投票できませんでした。";
        console.error(err);
    }
}

loadEventStateForParticipant();
setInterval(loadEventStateForParticipant, 5000);