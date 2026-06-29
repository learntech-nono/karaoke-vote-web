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
  document.getElementById("performances").textContent =
    JSON.stringify(data, null, 2);
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