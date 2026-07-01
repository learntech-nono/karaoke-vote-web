let entries = [];
let currentSortKey = "order";

async function loadEntries() {
  const data = await apiGet("/performance");
  entries = data.performances || [];
  renderEntries();
}

function renderEntries() {
  const tbody = document.getElementById("entryTableBody");

  const sorted = [...entries].sort((a, b) => {
    if (currentSortKey === "singer") {
      return (a.singer || "").localeCompare(b.singer || "", "ja");
    }
    return Number(a[currentSortKey] || 0) - Number(b[currentSortKey] || 0);
  });

  tbody.innerHTML = sorted.map(e => `
    <tr>
      <td>${e.order || ""}</td>
      <td>${e.singer || ""}</td>
      <td>${e.song || ""}</td>
      <td>${e.originSinger || ""}</td>
      <td>${e.key || ""}</td>
      <td>${e.choiceRank || ""}</td>
      <td>${e.voteCount || 0}</td>
      <td>
        <button onclick="editEntry('${e.performanceId}')">編集</button>
        <button onclick="deleteEntry('${e.performanceId}')">削除</button>
      </td>
    </tr>
  `).join("");
}

function sortEntries(key) {
  currentSortKey = key;
  renderEntries();
}

async function createEntry() {
  const body = {
    order: Number(document.getElementById("order").value || 0),
    choiceRank: Number(document.getElementById("choiceRank").value || 1),
    singer: document.getElementById("singer").value.trim(),
    song: document.getElementById("song").value.trim(),
    originSinger: document.getElementById("originSinger").value.trim(),
    key: document.getElementById("key").value.trim()
  };

  if (!body.singer || !body.song) {
    alert("ニックネームと曲名は必須です。");
    return;
  }

  await apiPost("/performance", body);

  clearForm();
  await loadEntries();
}

function clearForm() {
  document.getElementById("order").value = "";
  document.getElementById("choiceRank").value = "1";
  document.getElementById("singer").value = "";
  document.getElementById("song").value = "";
  document.getElementById("originSinger").value = "";
  document.getElementById("key").value = "";
}

function editEntry(performanceId) {
  alert("編集機能は次に実装します: " + performanceId);
}

function deleteEntry(performanceId) {
  alert("削除機能は次に実装します: " + performanceId);
}

loadEntries();