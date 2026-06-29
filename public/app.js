const API_BASE = "http://localhost:7071/api";

async function loadParticipants() {
  const res = await fetch(`${API_BASE}/participants`);
  const data = await res.json();
  document.getElementById("participants").textContent =
    JSON.stringify(data, null, 2);
}

async function loadPerformances() {
  const res = await fetch(`${API_BASE}/performance`);
  const data = await res.json();

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

async function startPerformance(performanceId, singer, song, order) {
  const res = await fetch(`${API_BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "singing",
      currentPerformanceId: performanceId,
      currentSinger: singer,
      currentSong: song,
      currentOrder: order,
      votingOpen: true
    })
  });

  const data = await res.json();
  alert(`開始しました：${singer} - ${song}`);
}

async function createPerformance() {
  const singer = document.getElementById("singer").value;
  const song = document.getElementById("song").value;

  const res = await fetch(`${API_BASE}/performance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      singer,
      song,
      audienceCount: 1
    })
  });

  const data = await res.json();
  alert("登録しました: " + data.performanceId);

  await loadPerformances();
}