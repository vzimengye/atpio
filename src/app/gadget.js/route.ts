export async function GET() {
  const script = `
(function () {
  var currentScript = document.currentScript;
  var projectId = currentScript && currentScript.getAttribute("data-project-id");
  var position = currentScript && currentScript.getAttribute("data-atpio-position") || "bottom-right";
  var theme = currentScript && currentScript.getAttribute("data-atpio-theme") || "light";
  var label = currentScript && currentScript.getAttribute("data-atpio-label") || "Feedback";
  var successCallback = currentScript && currentScript.getAttribute("data-atpio-success-callback");
  var metadata = {};
  if (currentScript) {
    Array.prototype.slice.call(currentScript.attributes).forEach(function (attribute) {
      if (attribute.name.indexOf("data-atpio-meta-") === 0) {
        metadata[attribute.name.replace("data-atpio-meta-", "")] = attribute.value;
      }
    });
  }
  if (!projectId) {
    console.warn("Atpio gadget: missing data-project-id.");
    return;
  }

  var origin = new URL(currentScript.src).origin;
  var existing = document.querySelector("[data-atpio-root='" + projectId + "']");
  if (existing) return;

  var root = document.createElement("div");
  root.setAttribute("data-atpio-root", projectId);
  root.style.position = "fixed";
  if (position.indexOf("right") >= 0) root.style.right = "20px";
  if (position.indexOf("left") >= 0) root.style.left = "20px";
  if (position.indexOf("top") >= 0) root.style.top = "20px";
  if (position.indexOf("bottom") >= 0) root.style.bottom = "20px";
  root.style.zIndex = "2147483647";
  root.style.fontFamily = "Arial, sans-serif";

  var button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.height = "44px";
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.background = theme === "dark" ? "#f7f1e8" : "#020617";
  button.style.color = theme === "dark" ? "#020617" : "#fff";
  button.style.padding = "0 18px";
  button.style.fontSize = "14px";
  button.style.fontWeight = "600";
  button.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.24)";
  button.style.cursor = "pointer";

  var panel = document.createElement("div");
  panel.hidden = true;
  panel.style.position = "absolute";
  if (position.indexOf("right") >= 0) panel.style.right = "0";
  if (position.indexOf("left") >= 0) panel.style.left = "0";
  if (position.indexOf("top") >= 0) panel.style.top = "56px";
  if (position.indexOf("bottom") >= 0) panel.style.bottom = "56px";
  panel.style.width = "min(420px, calc(100vw - 32px))";
  panel.style.height = "620px";
  panel.style.maxHeight = "calc(100vh - 96px)";
  panel.style.border = "1px solid #e2e8f0";
  panel.style.borderRadius = "12px";
  panel.style.overflow = "hidden";
  panel.style.background = theme === "dark" ? "#020617" : "#fff";
  panel.style.boxShadow = "0 24px 60px rgba(15, 23, 42, 0.22)";

  var iframe = document.createElement("iframe");
  iframe.title = "Atpio feedback form";
  var iframeUrl = new URL(origin + "/embed/" + encodeURIComponent(projectId));
  Object.keys(metadata).forEach(function (key) {
    iframeUrl.searchParams.set("meta_" + key, metadata[key]);
  });
  iframe.src = iframeUrl.toString();
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";

  panel.appendChild(iframe);
  root.appendChild(panel);
  root.appendChild(button);
  document.body.appendChild(root);

  button.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    button.textContent = panel.hidden ? label : "Close";
    window.dispatchEvent(new CustomEvent(panel.hidden ? "atpio:close" : "atpio:open", {
      detail: { projectId: projectId, metadata: metadata }
    }));
  });

  window.addEventListener("message", function (event) {
    if (!event.data || event.data.type !== "atpio:submitted") return;
    window.dispatchEvent(new CustomEvent("atpio:success", {
      detail: { projectId: projectId, metadata: metadata }
    }));
    if (successCallback && typeof window[successCallback] === "function") {
      window[successCallback]({ projectId: projectId, metadata: metadata });
    }
  });
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

