const dayKeyEl = document.getElementById("dayKey");
const countEl = document.getElementById("count");
const dirEl = document.getElementById("dir");
const statusEl = document.getElementById("status");
const captureBtn = document.getElementById("captureBtn");
const captureSpinner = document.getElementById("captureSpinner");
const captureLabel = document.getElementById("captureLabel");
const exportBtn = document.getElementById("exportBtn");
const openDirBtn = document.getElementById("openDirBtn");
const settingsBtn = document.getElementById("settingsBtn");

const jsonModal = document.getElementById("jsonModal");
const jsonPreview = document.getElementById("jsonPreview");
const closeModalBtn = document.getElementById("closeModalBtn");

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#ff8080" : "#b7c2d8";
}

function setCaptureLoading(loading) {
  captureBtn.disabled = loading;
  captureSpinner.classList.toggle("hidden", !loading);
  captureLabel.textContent = loading ? "Capturing..." : "Capture Tweet";
}

function setOtherButtonsDisabled(disabled) {
  exportBtn.disabled = disabled;
  openDirBtn.disabled = disabled;
  settingsBtn.disabled = disabled;
}

function openJsonModal(data) {
  jsonPreview.textContent = `${JSON.stringify(data, null, 2)}\n`;
  jsonModal.classList.remove("hidden");
}

function closeJsonModal() {
  jsonModal.classList.add("hidden");
}

function isTwitterUrl(url) {
  return /^https:\/\/(x\.com|twitter\.com)\//i.test(String(url || ""));
}

function isTweetDetailUrl(url) {
  return /^https:\/\/(x\.com|twitter\.com)\/[^/]+\/status\/\d+(?:[/?#]|$)/i.test(String(url || ""));
}

function isMissingReceiverError(err) {
  const message = err instanceof Error ? err.message : String(err || "");
  return /receiving end does not exist/i.test(message);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function captureThreadRawWithRetry(tabId) {
  try {
    return await chrome.tabs.sendMessage(tabId, { type: "CAPTURE_THREAD_RAW" });
  } catch (err) {
    if (!isMissingReceiverError(err)) throw err;

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
    });
    await sleep(120);
    return chrome.tabs.sendMessage(tabId, { type: "CAPTURE_THREAD_RAW" });
  }
}

async function refreshStatus() {
  const res = await chrome.runtime.sendMessage({ type: "GET_STATUS" });
  if (!res?.ok) {
    setStatus(res?.error || "Failed to read extension state.", true);
    return;
  }
  dayKeyEl.textContent = res.dayKey;
  countEl.textContent = String(res.count);
  dirEl.textContent = res.settings?.exportSubdir || "x-prompt-json";
}

async function captureAndExport() {
  setCaptureLoading(true);
  setOtherButtonsDisabled(true);
  try {
    const tab = await getActiveTab();
    if (!tab?.id) throw new Error("No active tab.");
    if (!isTwitterUrl(tab.url)) {
      throw new Error("Please open x.com/twitter.com first.");
    }
    if (!isTweetDetailUrl(tab.url)) {
      throw new Error("Capture only works on tweet detail pages: /<user>/status/<id>.");
    }

    const capture = await captureThreadRawWithRetry(tab.id);
    if (!capture?.ok) {
      throw new Error(capture?.error || "Could not capture tweet thread.");
    }

    const upsert = await chrome.runtime.sendMessage({
      type: "UPSERT_TEMPLATE_AND_EXPORT",
      bundle: capture.bundle,
    });

    if (!upsert?.ok) {
      throw new Error(upsert?.error || "Could not export JSON.");
    }

    if (upsert.noPrompt) {
      await refreshStatus();
      closeJsonModal();
      setStatus(upsert.reason || "No prompt found in main tweet or first 100 replies.", true);
      return;
    }

    await refreshStatus();
    openJsonModal({ templates: upsert.extracted || [] });

    const dedupText = upsert.duplicated ? "(duplicate skipped)" : "(added)";
    setStatus(`Exported ${upsert.filename}\nToday count: ${upsert.count} ${dedupText}`, false);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Capture failed.";
    if (isMissingReceiverError(err)) {
      setStatus("Capture script is not ready. Refresh the current X/Twitter tab and try again.", true);
    } else {
      setStatus(message, true);
    }
  } finally {
    setCaptureLoading(false);
    setOtherButtonsDisabled(false);
  }
}

async function exportTodayOnly() {
  exportBtn.disabled = true;
  captureBtn.disabled = true;
  openDirBtn.disabled = true;
  settingsBtn.disabled = true;
  try {
    const res = await chrome.runtime.sendMessage({ type: "EXPORT_TODAY" });
    if (!res?.ok) throw new Error(res?.error || "Export failed.");
    await refreshStatus();
    setStatus(`Exported ${res.filename}\nToday count: ${res.count}`, false);
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Export failed.", true);
  } finally {
    exportBtn.disabled = false;
    captureBtn.disabled = false;
    openDirBtn.disabled = false;
    settingsBtn.disabled = false;
  }
}

async function openJsonDirectory() {
  openDirBtn.disabled = true;
  captureBtn.disabled = true;
  exportBtn.disabled = true;
  settingsBtn.disabled = true;
  try {
    const res = await chrome.runtime.sendMessage({ type: "OPEN_JSON_DIRECTORY" });
    if (!res?.ok) throw new Error(res?.error || "Could not open JSON directory.");
    setStatus(res.message || "Opened JSON directory.", false);
  } catch (err) {
    setStatus(err instanceof Error ? err.message : "Could not open JSON directory.", true);
  } finally {
    openDirBtn.disabled = false;
    captureBtn.disabled = false;
    exportBtn.disabled = false;
    settingsBtn.disabled = false;
  }
}

captureBtn.addEventListener("click", () => {
  void captureAndExport();
});

exportBtn.addEventListener("click", () => {
  void exportTodayOnly();
});

openDirBtn.addEventListener("click", () => {
  void openJsonDirectory();
});

settingsBtn.addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

closeModalBtn.addEventListener("click", () => {
  closeJsonModal();
});

jsonModal.addEventListener("click", (event) => {
  if (event.target === jsonModal) {
    closeJsonModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !jsonModal.classList.contains("hidden")) {
    closeJsonModal();
  }
});

void refreshStatus();
