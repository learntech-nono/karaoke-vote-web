async function loadEventState() {
  const data = await apiGet("/events");
  document.getElementById("eventState").textContent =
    JSON.stringify(data, null, 2);
}

async function loadParticipants() {
  const data = await apiGet("/participants");
  document.getElementById("participants").textContent =
    JSON.stringify(data, null, 2);
}

async function loadPerformances() {
  const data = await apiGet("/performance");

  const html = data.performances.map(p => `
    <div style="border:1px solid #ccc; padding:10px; margin:8px 0;">
      <strong>${p.singer}</strong> - ${p.song}<br>
      投票数: ${p.voteCount}<br>
      <button onclick="startPerformance('${p.performanceId}', '${p.singer}', '${p.song}', ${p.order})">
        この曲を開始
      </button>
    </div>
  `).join("");

  document.getElementById("performances").innerHTML = html;
}

async function createPerformance() {
  const singer = document.getElementById("singer").value;
  const song = document.getElementById("song").value;

  const data = await apiPost("/performance", {
    singer,
    song,
    audienceCount: 1
  });

  alert("登録しました: " + data.performanceId);
  await loadPerformances();
}

async function startPerformance(performanceId, singer, song, order) {
  await apiPost("/events", {
    mode: "singing",
    currentPerformanceId: performanceId,
    currentSinger: singer,
    currentSong: song,
    currentOrder: order,
    votingOpen: true
  });

  alert(`開始しました：${singer} - ${song}`);
  await loadEventState();
}