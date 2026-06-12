# Mock Product Integration

Use this skill to build a mock host page that connects to an existing Atpio app.
The mock page represents a partner product. It does not implement Atpio itself;
it only loads Atpio's public gadget script.

## Goal

Create a separate page that:

1. Runs outside the Atpio app.
2. Loads `https://YOUR_ATPIO_DOMAIN/gadget.js`.
3. Passes either an Atpio `data-atpio-workspace-key` or a fixed `data-project-id`.
4. Shows the injected feedback button.
5. Opens the Atpio iframe when the button is clicked.

In local development:

- Atpio app: `http://127.0.0.1:3000`
- Mock product: `http://127.0.0.1:4000`
- Gadget script: `http://127.0.0.1:3000/gadget.js`

## Recommended Workspace Embed

Use this when the customer wants their external product to follow whatever
project they selected inside their Atpio account. This is the normal partner
integration path.

```html
<script
  src="https://YOUR_ATPIO_DOMAIN/gadget.js"
  data-atpio-workspace-key="wk_example_public_workspace_key"
  data-atpio-position="bottom-right"
  data-atpio-theme="light"
  data-atpio-label="Share feedback"
></script>
```

How it works:

1. The Atpio account owner creates projects in Atpio.
2. In Atpio, they mark one project as active for embeds.
3. The partner product loads `gadget.js` with that account's workspace key.
4. Atpio resolves the active project for that workspace key.
5. If no active project is selected, Atpio uses that account's newest project.
6. End users fill the feedback form without signing in.

Required attributes:

- `src`: Atpio app URL plus `/gadget.js`.
- `data-atpio-workspace-key`: the public workspace key from the Atpio account.

## Fixed Project Embed

Use a static script tag when the mock should always load one known Atpio
project:

```html
<script
  src="http://127.0.0.1:3000/gadget.js"
  data-project-id="project_example"
  data-atpio-position="bottom-right"
  data-atpio-theme="light"
  data-atpio-label="Share feedback"
></script>
```

For production-like testing, replace the script URL:

```html
<script
  src="https://YOUR_ATPIO_DOMAIN/gadget.js"
  data-project-id="project_example"
  data-atpio-position="bottom-right"
  data-atpio-label="Share feedback"
></script>
```

Required attributes for fixed project mode:

- `src`: Atpio app URL plus `/gadget.js`.
- `data-project-id`: the Atpio project ID to render.

Common optional attributes:

- `data-atpio-position`: `bottom-right`, `bottom-left`, `top-right`, or
  `top-left`.
- `data-atpio-theme`: `light` or `dark`.
- `data-atpio-label`: button label.
- `data-atpio-success-callback`: global callback function name.
- `data-atpio-meta-*`: metadata to attach to each submitted response.

## Dynamic Mock

Use JavaScript injection when the mock should choose a workspace key or project
ID at runtime. This is how `mock-product/index.html` previews an Atpio account's
active project.

```js
var atpioAppUrl = "http://127.0.0.1:3000";

function loadAtpioGadget(workspaceKey) {
  var oldRoot = document.querySelector("[data-atpio-root]");
  if (oldRoot) oldRoot.remove();

  var oldScript = document.querySelector("[data-atpio-mock-script]");
  if (oldScript) oldScript.remove();

  var script = document.createElement("script");
  script.src = atpioAppUrl + "/gadget.js";
  script.setAttribute("data-atpio-mock-script", "true");
  script.setAttribute("data-atpio-workspace-key", workspaceKey);
  script.setAttribute("data-atpio-position", "bottom-right");
  script.setAttribute("data-atpio-theme", "light");
  script.setAttribute("data-atpio-label", "Share feedback");
  script.setAttribute("data-atpio-meta-page", "mock-product");
  script.setAttribute("data-atpio-success-callback", "onAtpioSuccess");
  document.body.appendChild(script);
}
```

To load the active project metadata before mounting, call:

```js
var workspaceKey = "wk_example_public_workspace_key";
fetch(
  atpioAppUrl +
    "/api/projects/latest?workspaceKey=" +
    encodeURIComponent(workspaceKey) +
    "&t=" +
    Date.now(),
  {
  cache: "no-store",
  },
)
  .then(function (response) {
    if (!response.ok) throw new Error("Could not load active project.");
    return response.json();
  })
  .then(function (payload) {
    console.log("Loaded Atpio project", payload.project);
    loadAtpioGadget(workspaceKey);
  })
  .catch(function () {
    console.warn("Could not load Atpio project metadata.");
  });
```

## Events and Callback

The mock page can listen for gadget events:

```js
window.addEventListener("atpio:open", function (event) {
  console.log("Atpio opened", event.detail);
});

window.addEventListener("atpio:close", function (event) {
  console.log("Atpio closed", event.detail);
});

window.addEventListener("atpio:success", function (event) {
  console.log("Atpio submitted", event.detail);
});
```

If the script includes `data-atpio-success-callback="onAtpioSuccess"`, define:

```js
window.onAtpioSuccess = function (detail) {
  console.log("Submission completed", detail);
};
```

## Metadata

Use `data-atpio-meta-*` attributes to send mock product context with each
response:

```html
<script
  src="http://127.0.0.1:3000/gadget.js"
  data-atpio-workspace-key="wk_example_public_workspace_key"
  data-atpio-meta-page="pricing"
  data-atpio-meta-user-segment="trial"
  data-atpio-meta-experiment-id="onboarding-v2"
></script>
```

## Local Test

1. Start Atpio:

```bash
npm run dev
```

2. Start the mock product:

```bash
npm run mock-product
```

3. Open:

```text
http://127.0.0.1:4000
```

4. Create an Atpio account and save a project in Atpio.
5. Mark that project active for embeds.
6. Open the mock product with `?workspaceKey=YOUR_WORKSPACE_KEY`.
7. Confirm the mock page says it loaded that Atpio project.
8. Click the feedback button and confirm the Atpio iframe opens.
9. Submit the form and confirm the success event/callback logs in the browser
   console.

## Acceptance Checklist

- The mock page is separate from the Atpio app.
- The mock page loads `/gadget.js` from the Atpio URL.
- The script receives either the correct `data-atpio-workspace-key` or a fixed
  `data-project-id`.
- The feedback button appears.
- Clicking the button opens the Atpio iframe.
- Submitting the form saves a response in Atpio.
- Optional metadata appears on the saved response.
