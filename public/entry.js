let editingPerformanceId = null;
let entries = [];
let currentSortKey = "singer";

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
      <td>${e.singer || ""}</td>
      <td>${e.song || ""}</td>
      <td>${e.originSinger || ""}</td>
      <td>${e.key || ""}</td>
      <td>${e.choiceRank || ""}</td>
      <td>${e.order || ""}</td>
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
    singer: document.getElementById("singer").value.trim(),
    song: document.getElementById("song").value.trim(),
    originSinger: document.getElementById("originSinger").value.trim(),
    key: document.getElementById("key").value.trim(),
    choiceRank: Number(document.getElementById("choiceRank").value || 1),
    order: 0
  };

  if (!body.singer || !body.song) {
    alert("ニックネームと曲名は必須です。");
    return;
  }

  if (editingPerformanceId) {
    body.performanceId = editingPerformanceId;
    await apiPut("/performance", body);
    editingPerformanceId = null;
  } else {
    await apiPost("/performance", body);
  }

  clearForm();
  await loadEntries();
}

function clearForm() {
  document.getElementById("singer").value = "";
  document.getElementById("song").value = "";
  document.getElementById("originSinger").value = "";
  document.getElementById("key").value = "";
  document.getElementById("choiceRank").value = "1";
}

async function uploadExcel() {
  const fileInput = document.getElementById("excelFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Excelファイルを選択してください。");
    return;
  }

  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  let count = 0;

  for (const row of rows) {
    const body = {
      singer: String(row["ニックネーム"] || "").trim(),
      song: String(row["曲名"] || "").trim(),
      originSinger: String(row["原曲歌手"] || "").trim(),
      key: String(row["Key"] || "").trim(),
      choiceRank: Number(row["希望順位"] || 1),
      order: 0
    };

    if (!body.singer || !body.song) {
      continue;
    }

    await apiPost("/performance", body);
    count++;
  }

  alert(`${count}件を登録しました。`);
  fileInput.value = "";
  await loadEntries();
}

function editEntry(performanceId) {
  const entry = entries.find(e => e.performanceId === performanceId);

  if (!entry) {
    alert("対象データが見つかりません。");
    return;
  }

  editingPerformanceId = performanceId;

  document.getElementById("singer").value = entry.singer || "";
  document.getElementById("song").value = entry.song || "";
  document.getElementById("originSinger").value = entry.originSinger || "";
  document.getElementById("key").value = entry.key || "";
  document.getElementById("choiceRank").value = String(entry.choiceRank || 1);
}

async function deleteEntry(performanceId) {
  if (!confirm("この歌唱データを削除しますか？")) {
    return;
  }

  await apiDelete(`/performance?performanceId=${performanceId}`);
  await loadEntries();
}

loadEntries();