export async function GET() {
  const script = `
(function () {
  var currentScript = document.currentScript;
  var projectId = currentScript && currentScript.getAttribute("data-project-id");
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
  root.style.right = "20px";
  root.style.bottom = "20px";
  root.style.zIndex = "2147483647";
  root.style.fontFamily = "Arial, sans-serif";

  var button = document.createElement("button");
  button.type = "button";
  button.textContent = "Feedback";
  button.style.height = "44px";
  button.style.border = "0";
  button.style.borderRadius = "999px";
  button.style.background = "#020617";
  button.style.color = "#fff";
  button.style.padding = "0 18px";
  button.style.fontSize = "14px";
  button.style.fontWeight = "600";
  button.style.boxShadow = "0 12px 30px rgba(15, 23, 42, 0.24)";
  button.style.cursor = "pointer";

  var panel = document.createElement("div");
  panel.hidden = true;
  panel.style.position = "absolute";
  panel.style.right = "0";
  panel.style.bottom = "56px";
  panel.style.width = "min(420px, calc(100vw - 32px))";
  panel.style.height = "620px";
  panel.style.maxHeight = "calc(100vh - 96px)";
  panel.style.border = "1px solid #e2e8f0";
  panel.style.borderRadius = "12px";
  panel.style.overflow = "hidden";
  panel.style.background = "#fff";
  panel.style.boxShadow = "0 24px 60px rgba(15, 23, 42, 0.22)";

  var iframe = document.createElement("iframe");
  iframe.title = "Atpio feedback form";
  iframe.src = origin + "/embed/" + encodeURIComponent(projectId);
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "0";

  panel.appendChild(iframe);
  root.appendChild(panel);
  root.appendChild(button);
  document.body.appendChild(root);

  button.addEventListener("click", function () {
    panel.hidden = !panel.hidden;
    button.textContent = panel.hidden ? "Feedback" : "Close";
  });
})();`;

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

