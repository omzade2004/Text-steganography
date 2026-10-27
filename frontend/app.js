// Set this to your deployed FastAPI URL when hosting the frontend separately.
const API_BASE = (window.STEGANOGRAPHY_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");

const tabs = document.querySelectorAll(".tab");
const hideForm = document.querySelector("#hide-form");
const extractForm = document.querySelector("#extract-form");
const statusBox = document.querySelector("#status");
const resultBox = document.querySelector("#result");
const resultTitle = document.querySelector("#result-title");
const resultText = document.querySelector("#result-text");
const resultHint = document.querySelector("#result-hint");
const copyButton = document.querySelector("#copy-btn");

function setStatus(message = "", type = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${type}`;
}
function showResult(title, text, hint) {
  resultTitle.textContent = title;
  resultText.textContent = text;
  resultHint.textContent = hint;
  resultBox.classList.remove("hidden");
}
function clearResult() {
  resultBox.classList.add("hidden");
  setStatus();
}
function switchMode(mode) {
  tabs.forEach((tab) => {
    const active = tab.dataset.mode === mode;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });
  hideForm.classList.toggle("hidden", mode !== "hide");
  extractForm.classList.toggle("hidden", mode !== "extract");
  clearResult();
}
tabs.forEach((tab) => tab.addEventListener("click", () => switchMode(tab.dataset.mode)));

async function apiRequest(path, payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error("Cannot connect to the API. Start FastAPI and check the API URL.");
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg).join(", ")
      : data.detail;
    throw new Error(detail || "Request failed. Please check your input.");
  }
  return data;
}

hideForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const coverText = document.querySelector("#cover-text").value;
  const secretMessage = document.querySelector("#secret-message").value;
  if (!coverText.trim() || !secretMessage) {
    setStatus("Enter both cover text and a secret message.", "error");
    return;
  }
  const button = hideForm.querySelector("button[type='submit']");
  button.disabled = true;
  setStatus("Hiding your message…");
  resultBox.classList.add("hidden");
  try {
    const data = await apiRequest("/api/hide", {
      cover_text: coverText,
      secret_message: secretMessage,
    });
    showResult("Encoded text", data.encoded_text,
      "Copy the entire output. Some apps remove invisible Unicode characters, which can destroy the hidden message.");
    setStatus(data.message, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
});

extractForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const text = document.querySelector("#encoded-text").value;
  if (!text.trim()) {
    setStatus("Paste the encoded text first.", "error");
    return;
  }
  const button = extractForm.querySelector("button[type='submit']");
  button.disabled = true;
  setStatus("Extracting message…");
  resultBox.classList.add("hidden");
  try {
    const data = await apiRequest("/api/extract", { text });
    showResult("Secret message", data.secret_message, "Keep the extracted message private if it contains confidential information.");
    setStatus(data.message, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    button.disabled = false;
  }
});

copyButton.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(resultText.textContent);
    copyButton.textContent = "Copied!";
    setTimeout(() => { copyButton.textContent = "Copy"; }, 1400);
  } catch {
    setStatus("Clipboard access failed. Select and copy the result manually.", "error");
  }
});
