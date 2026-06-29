async function loadEventStateForParticipant() {
  const data = await apiGet("/events");
  const status = document.getElementById("status");

  if (!data.exists || !data.event) {
    status.innerHTML = "<p>イベント準備中です。</p>";
    return;
  }

  const event = data.event;

  if (event.mode === "singing" && event.votingOpen) {
    status.innerHTML = `
      <h2>現在歌唱中</h2>
      <h1>${event.currentSinger}</h1>
      <h2>♪ ${event.currentSong}</h2>
      <button>投票する</button>
    `;
    return;
  }

  status.innerHTML = "<p>次の歌唱をお待ちください。</p>";
}

loadEventStateForParticipant();
setInterval(loadEventStateForParticipant, 5000);