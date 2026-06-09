# Mock Product Integration

Use this skill to build a mock host page that connects to an existing Atpio app.
The mock page represents a partner product. It does not implement Atpio itself;
it only loads Atpio's public gadget script.

## Goal

Create a separate page that:

1. Runs outside the Atpio app.
2. Loads `https://YOUR_ATPIO_DOMAIN/gadget.js`.
3. Passes an Atpio `data-project-id`.
4. Shows the injected feedback button.
5. Opens the Atpio iframe when the button is clicked.

In local development:

- Atpio app: `http://127.0.0.1:3000`
- Mock product: `http://127.0.0.1:4000`
- Gadget script: `http://127.0.0.1:3000/gadget.js`

## Static Mock

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

Required attributes:

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

Use JavaScript injection when the mock should choose a project ID at runtime.
This is how `mock-product/index.html` previews the latest saved Atpio project.

```js
var atpioAppUrl = "http://127.0.0.1:3000";

function loadAtpioGadget(projectId) {
  var oldRoot = document.querySelector("[data-atpio-root]");
  if (oldRoot) oldRoot.remove();

  var oldScript = document.querySelector("[data-atpio-mock-script]");
  if (oldScript) oldScript.remove();

  var script = document.createElement("script");
  script.src = atpioAppUrl + "/gadget.js";
  script.setAttribute("data-atpio-mock-script", "true");
  script.setAttribute("data-project-id", projectId);
  script.setAttribute("data-atpio-position", "bottom-right");
  script.setAttribute("data-atpio-theme", "light");
  script.setAttribute("data-atpio-label", "Share feedback");
  script.setAttribute("data-atpio-meta-page", "mock-product");
  script.setAttribute("data-atpio-success-callback", "onAtpioSuccess");
  document.body.appendChild(script);
}
```

To load the latest saved Atpio project:

```js
fetch(atpioAppUrl + "/api/projects/latest?t=" + Date.now(), {
  cache: "no-store",
})
  .then(function (response) {
    if (!response.ok) throw new Error("Could not load latest project.");
    return response.json();
  })
  .then(function (payload) {
    var projectId = payload.project
      ? payload.project.id
      : "project_onboarding_feedback";
    loadAtpioGadget(projectId);
  })
  .catch(function () {
    loadAtpioGadget("project_onboarding_feedback");
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
  data-project-id="project_example"
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

4. Save a project in Atpio.
5. Refresh the mock page.
6. Confirm the mock page says it loaded the latest saved project.
7. Click the feedback button and confirm the Atpio iframe opens.
8. Submit the form and confirm the success event/callback logs in the browser
   console.

## Acceptance Checklist

- The mock page is separate from the Atpio app.
- The mock page loads `/gadget.js` from the Atpio URL.
- The script receives the correct `data-project-id`.
- The feedback button appears.
- Clicking the button opens the Atpio iframe.
- Submitting the form saves a response in Atpio.
- Optional metadata appears on the saved response.
