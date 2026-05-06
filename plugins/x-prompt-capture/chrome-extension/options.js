const exportSubdirInput = document.getElementById("exportSubdir");
const openAIBaseUrlInput = document.getElementById("openAIBaseUrl");
const openAIApiKeyInput = document.getElementById("openAIApiKey");
const openAIModelInput = document.getElementById("openAIModel");
const toggleApiKeyBtn = document.getElementById("toggleApiKeyBtn");
const saveBtn = document.getElementById("saveBtn");
const statusEl = document.getElementById("status");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff8080" : "#b7c2d8";
}

function setApiKeyVisible(visible) {
  openAIApiKeyInput.type = visible ? "text" : "password";
  toggleApiKeyBtn.textContent = visible ? "🙈" : "👁";
  toggleApiKeyBtn.setAttribute("aria-pressed", String(visible));
  toggleApiKeyBtn.setAttribute("aria-label", visible ? "Hide API key" : "Show API key");
  toggleApiKeyBtn.title = visible ? "Hide API key" : "Show API key";
}

async function load() {
  const res = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  if (!res?.ok) {
    setStatus(res?.error || "Failed to load settings.", true);
    return;
  }

  exportSubdirInput.value = res.settings?.exportSubdir || "x-prompt-json";
  openAIBaseUrlInput.value = res.settings?.openAIBaseUrl || "https://api.openai.com";
  openAIApiKeyInput.value = res.settings?.openAIApiKey || "";
  openAIModelInput.value = res.settings?.openAIModel || "gpt-4o-mini";
  setStatus(`Current day: ${res.dayKey}, captured: ${res.count}`);
}

async function save() {
  const exportSubdir = String(exportSubdirInput.value || "").trim();
  const openAIBaseUrl = String(openAIBaseUrlInput.value || "").trim();
  const openAIApiKey = String(openAIApiKeyInput.value || "").trim();
  const openAIModel = String(openAIModelInput.value || "").trim();

  const res = await chrome.runtime.sendMessage({
    type: "SAVE_SETTINGS",
    settings: { exportSubdir, openAIBaseUrl, openAIApiKey, openAIModel },
  });

  if (!res?.ok) {
    setStatus(res?.error || "Failed to save settings.", true);
    return;
  }

  exportSubdirInput.value = res.settings?.exportSubdir || "x-prompt-json";
  openAIBaseUrlInput.value = res.settings?.openAIBaseUrl || "https://api.openai.com";
  openAIApiKeyInput.value = res.settings?.openAIApiKey || "";
  openAIModelInput.value = res.settings?.openAIModel || "gpt-4o-mini";
  setStatus(`Saved. Export directory: ${exportSubdirInput.value}`);
}

saveBtn.addEventListener("click", () => {
  void save();
});

toggleApiKeyBtn.addEventListener("click", () => {
  setApiKeyVisible(openAIApiKeyInput.type === "password");
});

void load();
