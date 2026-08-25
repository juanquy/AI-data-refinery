// Data Refinery Chrome Extension Popup Controller

const API_BASE = "https://data-refinery-worker.juanquy.workers.dev";

document.addEventListener("DOMContentLoaded", async () => {
  const pageUrlEl = document.getElementById("pageUrl");
  const promptInput = document.getElementById("promptInput");
  const domainSelect = document.getElementById("domainSelect");
  const btnRefine = document.getElementById("btnRefine");
  const resultContainer = document.getElementById("resultContainer");
  const jsonOutput = document.getElementById("jsonOutput");
  const btnCopy = document.getElementById("btnCopy");

  let currentTabUrl = "";

  // 1. Get active tab URL
  try {
    if (typeof chrome !== "undefined" && chrome.tabs) {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.url) {
        currentTabUrl = tab.url;
        pageUrlEl.textContent = tab.url;
      }
    } else {
      currentTabUrl = "https://news.ycombinator.com";
      pageUrlEl.textContent = currentTabUrl;
    }
  } catch (err) {
    pageUrlEl.textContent = "Unable to read active tab";
  }

  // 2. Refine Button Click
  btnRefine.addEventListener("click", async () => {
    if (!currentTabUrl || !currentTabUrl.startsWith("http")) {
      alert("Please navigate to a valid HTTP/HTTPS webpage first.");
      return;
    }

    btnRefine.disabled = true;
    btnRefine.innerHTML = "<span>⏳ Refining with Llama 3.3...</span>";
    resultContainer.style.display = "none";

    try {
      const res = await fetch(`${API_BASE}/api/v1/custom/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceUrl: currentTabUrl,
          domainName: domainSelect.value,
          instructionPrompt: promptInput.value.trim() || "Extract all structured information, tables, and pricing facts into strict JSON."
        })
      });

      const data = await res.json();
      resultContainer.style.display = "block";
      jsonOutput.textContent = JSON.stringify(data.structuredData || data, null, 2);
    } catch (err) {
      resultContainer.style.display = "block";
      jsonOutput.textContent = JSON.stringify({ error: err.message }, null, 2);
    } finally {
      btnRefine.disabled = false;
      btnRefine.innerHTML = "<span>⚡ Refine Webpage into JSON</span>";
    }
  });

  // 3. Copy JSON Button
  btnCopy.addEventListener("click", () => {
    navigator.clipboard.writeText(jsonOutput.textContent);
    btnCopy.textContent = "Copied!";
    setTimeout(() => {
      btnCopy.textContent = "Copy JSON";
    }, 2000);
  });
});
