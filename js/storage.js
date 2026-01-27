function saveAnalysis(data) {
  localStorage.setItem("lastChatAnalysis", JSON.stringify(data));
}

function loadAnalysis() {
  const data = localStorage.getItem("lastChatAnalysis");
  return data ? JSON.parse(data) : null;
}

export { saveAnalysis, loadAnalysis };
